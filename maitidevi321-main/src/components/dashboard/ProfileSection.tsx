import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Save,
  Shield,
  Check,
  AlertCircle,
  FileText,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  city: string;
  country: string;
  avatar: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isKycVerified: boolean;
}

export function ProfileSection() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@email.com",
    phone: "+91 98765 43210",
    dob: "1995-05-15",
    address: "123 Main Street",
    city: "Kathmandu",
    country: "Nepal",
    avatar: "",
    isEmailVerified: true,
    isPhoneVerified: false,
    isKycVerified: false,
  });

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  const handleAvatarUpload = () => {
    toast.info("Avatar upload feature coming soon!");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Profile Header */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl sm:text-3xl font-bold text-primary-foreground">
              {profile.firstName[0]}{profile.lastName[0]}
            </div>
            <button
              onClick={handleAvatarUpload}
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-background"
            >
              <Camera className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-xl sm:text-2xl font-bold">{profile.firstName} {profile.lastName}</h2>
            <p className="text-muted-foreground">{profile.email}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
              <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                profile.isEmailVerified ? "bg-neon-green/10 text-neon-green" : "bg-muted text-muted-foreground"
              }`}>
                {profile.isEmailVerified ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                Email
              </span>
              <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                profile.isPhoneVerified ? "bg-neon-green/10 text-neon-green" : "bg-accent/10 text-accent"
              }`}>
                {profile.isPhoneVerified ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                Phone
              </span>
              <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                profile.isKycVerified ? "bg-neon-green/10 text-neon-green" : "bg-accent/10 text-accent"
              }`}>
                {profile.isKycVerified ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                KYC
              </span>
            </div>
          </div>
          <Button
            variant={isEditing ? "neon" : "outline"}
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="gap-2"
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            ) : (
              <>
                <User className="w-4 h-4" /> Edit Profile
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Personal Information */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Personal Information
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email
              {profile.isEmailVerified && <Check className="w-3 h-3 text-neon-green" />}
            </Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> Phone
              {!profile.isPhoneVerified && (
                <button className="text-xs text-primary hover:underline">Verify</button>
              )}
            </Label>
            <Input
              id="phone"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Date of Birth
            </Label>
            <Input
              id="dob"
              type="date"
              value={profile.dob}
              onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Address Information
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={profile.city}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={profile.country}
              onChange={(e) => setProfile({ ...profile, country: e.target.value })}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* KYC Verification */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          KYC Verification
        </h3>
        {profile.isKycVerified ? (
          <div className="flex items-center gap-3 p-4 bg-neon-green/10 rounded-lg border border-neon-green/30">
            <Check className="w-6 h-6 text-neon-green" />
            <div>
              <p className="font-medium text-neon-green">Verified</p>
              <p className="text-sm text-muted-foreground">Your identity has been verified</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-accent/10 rounded-lg border border-accent/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Verification Required</p>
                  <p className="text-sm text-muted-foreground">
                    Complete KYC to unlock higher withdrawal limits and exclusive features.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 border border-dashed border-border rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Government ID</p>
                    <p className="text-xs text-muted-foreground">Passport, License, or National ID</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Upload className="w-4 h-4" /> Upload Document
                </Button>
              </div>
              <div className="p-4 border border-dashed border-border rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <Camera className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Selfie with ID</p>
                    <p className="text-xs text-muted-foreground">Hold your ID next to your face</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Camera className="w-4 h-4" /> Take Photo
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
