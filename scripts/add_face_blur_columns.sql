-- SQL migration script to add Face Blur Filter columns

-- 1. Update profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS face_blur_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS avatar_face_coordinates JSONB DEFAULT null;

-- 2. Update profile_media table
ALTER TABLE profile_media 
ADD COLUMN IF NOT EXISTS face_blur_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS face_coordinates JSONB DEFAULT null;

-- 3. Seed mock face coordinates and set face_blur_active = true for testing on Sofia, Elena, and Valentina
-- Avatar coordinates follow { x: number, y: number, r: number } normalized relative to image size.
UPDATE profiles 
SET face_blur_active = true,
    avatar_face_coordinates = '{"x": 0.5, "y": 0.35, "r": 0.18}'::jsonb
WHERE id IN ('sofia', 'elena', 'valentina');

-- Update public/hidden media items with face coordinates for testing
UPDATE profile_media
SET face_blur_enabled = true,
    face_coordinates = '{"x": 0.5, "y": 0.4, "r": 0.22}'::jsonb
WHERE user_id IN ('sofia', 'elena', 'valentina');
