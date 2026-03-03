-- Fix attendance table to allow null employee_id
ALTER TABLE attendances ALTER COLUMN employee_id DROP NOT NULL;
