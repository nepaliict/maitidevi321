from fastapi import APIRouter, HTTPException, Depends, status, Query
from config.database import db
from models.support import Ticket, TicketCreate, TicketMessage
from middleware.auth import get_current_user, require_admin
from typing import List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix='/support', tags=['Support'])

@router.post('/tickets', response_model=Ticket, status_code=status.HTTP_201_CREATED)
async def create_ticket(
    ticket_data: TicketCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create support ticket"""
    try:
        # Create initial message
        initial_message = TicketMessage(
            message=ticket_data.message,
            sender_id=current_user['user_id'],
            is_admin=False
        )
        
        ticket = Ticket(
            user_id=current_user['user_id'],
            subject=ticket_data.subject,
            category=ticket_data.category,
            priority=ticket_data.priority,
            messages=[initial_message]
        )
        
        await db.tickets.insert_one(ticket.dict())
        
        logger.info(f'Ticket created: {ticket.id} by {current_user["user_id"]}')
        
        return ticket
    except Exception as e:
        logger.error(f'Create ticket error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to create ticket')

@router.get('/tickets', response_model=List[Ticket])
async def get_tickets(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Get tickets (role-based filtering)"""
    try:
        filter_query = {}
        
        # Role-based filtering
        if current_user['role'] == 'user':
            filter_query['user_id'] = current_user['user_id']
        # Admins see all tickets
        
        if status:
            filter_query['status'] = status
        if category:
            filter_query['category'] = category
        
        tickets = await db.tickets.find(filter_query).sort('updated_at', -1).skip(skip).limit(limit).to_list(limit)
        
        return [Ticket(**t) for t in tickets]
    except Exception as e:
        logger.error(f'Get tickets error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to get tickets')

@router.get('/tickets/{ticket_id}', response_model=Ticket)
async def get_ticket(
    ticket_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get ticket details"""
    try:
        ticket = await db.tickets.find_one({'id': ticket_id})
        
        if not ticket:
            raise HTTPException(status_code=404, detail='Ticket not found')
        
        # Check access
        if current_user['role'] == 'user' and ticket['user_id'] != current_user['user_id']:
            raise HTTPException(status_code=403, detail='Access denied')
        
        return Ticket(**ticket)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Get ticket error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to get ticket')

@router.post('/tickets/{ticket_id}/reply')
async def reply_to_ticket(
    ticket_id: str,
    message: str,
    current_user: dict = Depends(get_current_user)
):
    """Reply to ticket"""
    try:
        ticket = await db.tickets.find_one({'id': ticket_id})
        
        if not ticket:
            raise HTTPException(status_code=404, detail='Ticket not found')
        
        # Check access
        is_admin = current_user['role'] in ['admin', 'master_admin']
        if not is_admin and ticket['user_id'] != current_user['user_id']:
            raise HTTPException(status_code=403, detail='Access denied')
        
        # Create message
        new_message = TicketMessage(
            message=message,
            sender_id=current_user['user_id'],
            is_admin=is_admin
        )
        
        # Update ticket
        await db.tickets.update_one(
            {'id': ticket_id},
            {
                '$push': {'messages': new_message.dict()},
                '$set': {'updated_at': datetime.utcnow()}
            }
        )
        
        # If admin replied, set status to in_progress
        if is_admin and ticket['status'] == 'open':
            await db.tickets.update_one(
                {'id': ticket_id},
                {'$set': {'status': 'in_progress', 'assigned_to': current_user['user_id']}}
            )
        
        logger.info(f'Reply added to ticket: {ticket_id} by {current_user["user_id"]}')
        
        return {'message': 'Reply added successfully', 'ticket_id': ticket_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Reply to ticket error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to reply to ticket')

@router.patch('/tickets/{ticket_id}/close')
async def close_ticket(
    ticket_id: str,
    current_user: dict = Depends(require_admin())
):
    """Close ticket (Admin only)"""
    try:
        ticket = await db.tickets.find_one({'id': ticket_id})
        
        if not ticket:
            raise HTTPException(status_code=404, detail='Ticket not found')
        
        await db.tickets.update_one(
            {'id': ticket_id},
            {'$set': {'status': 'closed', 'updated_at': datetime.utcnow()}}
        )
        
        logger.info(f'Ticket closed: {ticket_id}')
        
        return {'message': 'Ticket closed', 'ticket_id': ticket_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Close ticket error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to close ticket')
