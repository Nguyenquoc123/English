-- Chạy script này trên DB EnglishLearn nếu bảng teacher_profiles chưa có cột phone
USE [EnglishLearn];
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.teacher_profiles') AND name = 'phone'
)
BEGIN
    ALTER TABLE [dbo].[teacher_profiles]
    ADD [phone] [nvarchar](20) NULL;
END
GO
