from fastapi import APIRouter, HTTPException, Depends, status, Query
from config.database import db
from models.kyc import KYCDocument, KYCDocumentCreate
from middleware.auth import get_current_user, require_admin
from typing import List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix='/kyc', tags=['KYC Verification'])

@router.post('/upload', response_model=KYCDocument, status_code=status.HTTP_201_CREATED)
async def upload_kyc_document(
    kyc_data: KYCDocumentCreate,
    current_user: dict = Depends(get_current_user)
):
    """Upload KYC documents"""
    try:
        # Check if user already has pending/approved KYC
        existing = await db.kyc_documents.find_one({
            'user_id': current_user['user_id'],
            'status': {'$in': ['pending', 'approved']}
        })
        
        if existing:
            raise HTTPException(
                status_code=400,
                detail='KYC already submitted. Please wait for review.'
            )
        
        kyc_doc = KYCDocument(**kyc_data.dict(), user_id=current_user['user_id'])
        await db.kyc_documents.insert_one(kyc_doc.dict())
        
        logger.info(f'KYC uploaded: {kyc_doc.id} by {current_user["user_id"]}')
        
        return kyc_doc
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Upload KYC error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to upload KYC')

@router.get('/status', response_model=KYCDocument)
async def get_my_kyc_status(
    current_user: dict = Depends(get_current_user)
):
    """Get user's KYC status"""
    try:
        kyc = await db.kyc_documents.find_one(
            {'user_id': current_user['user_id']},
            sort=[('created_at', -1)]
        )
        
        if not kyc:
            raise HTTPException(status_code=404, detail='No KYC document found')
        
        return KYCDocument(**kyc)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Get KYC status error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to get KYC status')

@router.get('/pending', response_model=List[KYCDocument])
async def get_pending_kyc(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(require_admin())
):
    """Get pending KYC documents (Admin review queue)"""
    try:
        kyc_docs = await db.kyc_documents.find(
            {'status': 'pending'}
        ).sort('created_at', 1).skip(skip).limit(limit).to_list(limit)
        
        return [KYCDocument(**doc) for doc in kyc_docs]
    except Exception as e:
        logger.error(f'Get pending KYC error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to get pending KYC')

@router.patch('/{kyc_id}/approve')
async def approve_kyc(
    kyc_id: str,
    review_notes: Optional[str] = None,
    current_user: dict = Depends(require_admin())
):
    """Approve KYC (Admin only)"""
    try:
        kyc = await db.kyc_documents.find_one({'id': kyc_id})
        
        if not kyc:
            raise HTTPException(status_code=404, detail='KYC document not found')
        
        if kyc['status'] != 'pending':
            raise HTTPException(status_code=400, detail='KYC already reviewed')
        
        # Update KYC status
        await db.kyc_documents.update_one(
            {'id': kyc_id},
            {'$set': {
                'status': 'approved',
                'reviewed_by': current_user['user_id'],
                'review_notes': review_notes,
                'reviewed_at': datetime.utcnow()
            }}
        )
        
        # Update user KYC status
        await db.users.update_one(
            {'id': kyc['user_id']},
            {'$set': {'kyc_status': 'approved'}}
        )
        
        logger.info(f'KYC approved: {kyc_id} for user {kyc["user_id"]}')
        
        return {'message': 'KYC approved successfully', 'kyc_id': kyc_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Approve KYC error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to approve KYC')

@router.patch('/{kyc_id}/reject')
async def reject_kyc(
    kyc_id: str,
    review_notes: str,
    current_user: dict = Depends(require_admin())
):
    """Reject KYC (Admin only)"""
    try:
        kyc = await db.kyc_documents.find_one({'id': kyc_id})
        
        if not kyc:
            raise HTTPException(status_code=404, detail='KYC document not found')
        
        if kyc['status'] != 'pending':
            raise HTTPException(status_code=400, detail='KYC already reviewed')
        
        await db.kyc_documents.update_one(
            {'id': kyc_id},
            {'$set': {
                'status': 'rejected',
                'reviewed_by': current_user['user_id'],
                'review_notes': review_notes,
                'reviewed_at': datetime.utcnow()
            }}
        )
        
        await db.users.update_one(
            {'id': kyc['user_id']},
            {'$set': {'kyc_status': 'rejected'}}
        )
        
        logger.info(f'KYC rejected: {kyc_id}')
        
        return {'message': 'KYC rejected', 'kyc_id': kyc_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Reject KYC error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to reject KYC')
