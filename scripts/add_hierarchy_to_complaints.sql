-- =====================================
-- ADD ORGANIZATIONAL HIERARCHY TO COMPLAINTS
-- =====================================
-- This script adds sector_id, division_id, department_id, team_id to both
-- complaints and public_complaints tables with proper foreign key constraints

-- =====================================
-- 1. ADD HIERARCHY COLUMNS TO COMPLAINTS TABLE
-- =====================================

-- Add organizational hierarchy columns to complaints table
ALTER TABLE complaints 
ADD COLUMN sector_id INT NULL COMMENT 'Reference to organizational sector',
ADD COLUMN division_id INT NULL COMMENT 'Reference to organizational division',
ADD COLUMN department_id INT NULL COMMENT 'Reference to organizational department (new hierarchy)',
ADD COLUMN team_id INT NULL COMMENT 'Reference to organizational team';

-- Add foreign key constraints for complaints
ALTER TABLE complaints
ADD CONSTRAINT fk_complaints_sector 
    FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_complaints_division 
    FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_complaints_department_hierarchy 
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_complaints_team 
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;

-- Add indexes for better query performance
CREATE INDEX idx_complaints_sector ON complaints(sector_id);
CREATE INDEX idx_complaints_division ON complaints(division_id);
CREATE INDEX idx_complaints_department_hierarchy ON complaints(department_id);
CREATE INDEX idx_complaints_team ON complaints(team_id);

-- =====================================
-- 2. ADD HIERARCHY COLUMNS TO PUBLIC_COMPLAINTS TABLE
-- =====================================

-- Add organizational hierarchy columns to public_complaints table
ALTER TABLE public_complaints 
ADD COLUMN sector_id INT NULL COMMENT 'Reference to organizational sector',
ADD COLUMN division_id INT NULL COMMENT 'Reference to organizational division',
ADD COLUMN department_id INT NULL COMMENT 'Reference to organizational department (new hierarchy)',
ADD COLUMN team_id INT NULL COMMENT 'Reference to organizational team';

-- Add foreign key constraints for public_complaints
ALTER TABLE public_complaints
ADD CONSTRAINT fk_public_complaints_sector 
    FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_public_complaints_division 
    FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_public_complaints_department_hierarchy 
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_public_complaints_team 
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;

-- Add indexes for better query performance
CREATE INDEX idx_public_complaints_sector ON public_complaints(sector_id);
CREATE INDEX idx_public_complaints_division ON public_complaints(division_id);
CREATE INDEX idx_public_complaints_department_hierarchy ON public_complaints(department_id);
CREATE INDEX idx_public_complaints_team ON public_complaints(team_id);

-- =====================================
-- 3. UPDATE EXISTING COMPLAINTS WITH SAMPLE HIERARCHY DATA
-- =====================================

-- Update existing complaints with sample organizational hierarchy assignments
-- This assumes you have already inserted the hierarchy data from previous scripts

-- Assign complaints to Public Administration sector (sector_id = 1)
UPDATE complaints 
SET sector_id = 1, 
    division_id = 1, 
    department_id = 1, 
    team_id = 1 
WHERE id % 4 = 1 AND sector_id IS NULL;

-- Assign complaints to Health Services sector (sector_id = 2)
UPDATE complaints 
SET sector_id = 2, 
    division_id = 4, 
    department_id = 7, 
    team_id = NULL 
WHERE id % 4 = 2 AND sector_id IS NULL;

-- Assign complaints to Education sector (sector_id = 3)
UPDATE complaints 
SET sector_id = 3, 
    division_id = 6, 
    department_id = 11, 
    team_id = NULL 
WHERE id % 4 = 3 AND sector_id IS NULL;

-- Assign complaints to Infrastructure Development sector (sector_id = 4)
UPDATE complaints 
SET sector_id = 4, 
    division_id = 8, 
    department_id = NULL, 
    team_id = NULL 
WHERE id % 4 = 0 AND sector_id IS NULL;

-- =====================================
-- 4. UPDATE EXISTING PUBLIC COMPLAINTS WITH SAMPLE HIERARCHY DATA
-- =====================================

-- Update existing public complaints with sample organizational hierarchy assignments

-- Assign public complaints to Public Administration sector (sector_id = 1)
UPDATE public_complaints 
SET sector_id = 1, 
    division_id = 2, 
    department_id = 3, 
    team_id = 6 
WHERE id % 4 = 1 AND sector_id IS NULL;

-- Assign public complaints to Health Services sector (sector_id = 2)
UPDATE public_complaints 
SET sector_id = 2, 
    division_id = 5, 
    department_id = 8, 
    team_id = NULL 
WHERE id % 4 = 2 AND sector_id IS NULL;

-- Assign public complaints to Education sector (sector_id = 3)
UPDATE public_complaints 
SET sector_id = 3, 
    division_id = 7, 
    department_id = 13, 
    team_id = NULL 
WHERE id % 4 = 3 AND sector_id IS NULL;

-- Assign public complaints to Infrastructure Development sector (sector_id = 4)
UPDATE public_complaints 
SET sector_id = 4, 
    division_id = 9, 
    department_id = NULL, 
    team_id = NULL 
WHERE id % 4 = 0 AND sector_id IS NULL;

-- =====================================
-- 5. VERIFICATION QUERIES
-- =====================================

-- Check the updated table structures
DESCRIBE complaints;
DESCRIBE public_complaints;

-- Verify the hierarchy assignments
SELECT 
    'COMPLAINTS' as table_name,
    COUNT(*) as total_complaints,
    COUNT(sector_id) as with_sector,
    COUNT(division_id) as with_division,
    COUNT(department_id) as with_department,
    COUNT(team_id) as with_team
FROM complaints
UNION ALL
SELECT 
    'PUBLIC_COMPLAINTS' as table_name,
    COUNT(*) as total_complaints,
    COUNT(sector_id) as with_sector,
    COUNT(division_id) as with_division,
    COUNT(department_id) as with_department,
    COUNT(team_id) as with_team
FROM public_complaints;

-- Sample complaints with hierarchy information
SELECT 
    c.id,
    c.complainant_name,
    c.tracking_code,
    c.status,
    s.name as sector,
    d.name as division,
    dept.name as department,
    t.name as team
FROM complaints c
LEFT JOIN sectors s ON c.sector_id = s.id
LEFT JOIN divisions d ON c.division_id = d.id
LEFT JOIN departments dept ON c.department_id = dept.id
LEFT JOIN teams t ON c.team_id = t.id
WHERE c.sector_id IS NOT NULL
LIMIT 10;

-- Sample public complaints with hierarchy information
SELECT 
    pc.id,
    pc.complainant_name,
    pc.tracking_code,
    pc.status,
    s.name as sector,
    d.name as division,
    dept.name as department,
    t.name as team
FROM public_complaints pc
LEFT JOIN sectors s ON pc.sector_id = s.id
LEFT JOIN divisions d ON pc.division_id = d.id
LEFT JOIN departments dept ON pc.department_id = dept.id
LEFT JOIN teams t ON pc.team_id = t.id
WHERE pc.sector_id IS NOT NULL
LIMIT 10;

-- =====================================
-- 6. CREATE VIEWS FOR EASY QUERYING
-- =====================================

-- Create view for complaints with full hierarchy information
CREATE OR REPLACE VIEW complaints_with_hierarchy AS
SELECT 
    c.*,
    s.name as sector_name,
    d.name as division_name,
    dept.name as department_name,
    t.name as team_name,
    CONCAT(s.name, ' > ', d.name, ' > ', COALESCE(dept.name, 'N/A'), ' > ', COALESCE(t.name, 'N/A')) as full_hierarchy_path
FROM complaints c
LEFT JOIN sectors s ON c.sector_id = s.id
LEFT JOIN divisions d ON c.division_id = d.id
LEFT JOIN departments dept ON c.department_id = dept.id
LEFT JOIN teams t ON c.team_id = t.id;

-- Create view for public complaints with full hierarchy information
CREATE OR REPLACE VIEW public_complaints_with_hierarchy AS
SELECT 
    pc.*,
    s.name as sector_name,
    d.name as division_name,
    dept.name as department_name,
    t.name as team_name,
    CONCAT(s.name, ' > ', d.name, ' > ', COALESCE(dept.name, 'N/A'), ' > ', COALESCE(t.name, 'N/A')) as full_hierarchy_path
FROM public_complaints pc
LEFT JOIN sectors s ON pc.sector_id = s.id
LEFT JOIN divisions d ON pc.division_id = d.id
LEFT JOIN departments dept ON pc.department_id = dept.id
LEFT JOIN teams t ON pc.team_id = t.id;

-- =====================================
-- 7. SAMPLE QUERIES FOR TESTING
-- =====================================

-- Get all complaints for a specific sector
-- SELECT * FROM complaints_with_hierarchy WHERE sector_id = 1;

-- Get all public complaints for a specific division
-- SELECT * FROM public_complaints_with_hierarchy WHERE division_id = 2;

-- Get complaints grouped by organizational hierarchy
-- SELECT 
--     sector_name,
--     division_name,
--     COUNT(*) as complaint_count
-- FROM complaints_with_hierarchy 
-- WHERE sector_id IS NOT NULL
-- GROUP BY sector_name, division_name
-- ORDER BY complaint_count DESC;

-- Get public complaints with full hierarchy path
-- SELECT 
--     complainant_name,
--     tracking_code,
--     status,
--     full_hierarchy_path
-- FROM public_complaints_with_hierarchy 
-- WHERE sector_id IS NOT NULL
-- ORDER BY created_at DESC
-- LIMIT 20;

COMMIT;
