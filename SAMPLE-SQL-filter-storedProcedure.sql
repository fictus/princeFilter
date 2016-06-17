USE [Engineering]
GO

/****** Object:  StoredProcedure [dbo].[spSampleTable_Filter]    Script Date: 06/17/2016 11:16:34 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

-- ========= ============================================ =========        
-- Author: Luis Valle     
-- Date: 
-- Parent Application: www.xxx.com	
-- Called by: xxx.aspx
-- Description: 
-- ========= ============================================ =========  
CREATE PROCEDURE [dbo].[spSampleTable_Filter]
	@Page INT,
	@Size INT,
	@QueryIsCount BIT,
	@SortColumn NVARCHAR(20),
	@SortDirection NVARCHAR(5),
	
	-- Your Specific Filter variables:
	@fl_PartNumber NVARCHAR(50) = NULL,
	@fl_PrinceRevision NVARCHAR(50) = NULL,
	@fl_ItemDescription NVARCHAR(50) = NULL,
	@fl_MaterialType NVARCHAR(50) = NULL,
	@fl_FinishType NVARCHAR(50) = NULL,
	@fl_PartDiameter NVARCHAR(30) = NULL,
	@fl_PartLength NVARCHAR(30) = NULL,	
	@fl_Hardened NVARCHAR(4) = NULL,
	@fl_OtherInfo nvarchar(50) = NULL,
	@fl_NextAssembly NVARCHAR(50) = NULL,
	@fl_PPapRequired NVARCHAR(4) = NULL,	
	@fl_DateEntered DATETIME = NULL
AS
BEGIN
	DECLARE @local_PartNumber NVARCHAR(50),
		@local_PrinceRevision NVARCHAR(50),
		@local_ItemDescription NVARCHAR(50),
		@local_MaterialType NVARCHAR(50),
		@local_FinishType NVARCHAR(50),
		@local_PartDiameter NVARCHAR(30),
		@local_PartLength NVARCHAR(30),
		@local_Hardened NVARCHAR(4),
		@local_OtherInfo nvarchar(50),
		@local_NextAssembly NVARCHAR(50),
		@local_PPapRequired NVARCHAR(4),		
		@local_DateEntered DATETIME
		
	SELECT @local_PartNumber=@fl_PartNumber,
		@local_PrinceRevision=@fl_PrinceRevision,
		@local_ItemDescription=@fl_ItemDescription,
		@local_MaterialType=@fl_MaterialType,
		@local_FinishType=@fl_FinishType,
		@local_PartDiameter=@fl_PartDiameter,
		@local_PartLength=@fl_PartLength,
		@local_Hardened=@fl_Hardened,
		@local_OtherInfo=@fl_OtherInfo,
		@local_NextAssembly=@fl_NextAssembly,
		@local_PPapRequired=@fl_PPapRequired,		
		@local_DateEntered=@fl_DateEntered;						
			
	IF @QueryIsCount = 1
			BEGIN
				SET NOCOUNT ON;
				
				WITH HistorySetA AS
				(
					SELECT * FROM dbo.tbl_SampleTable
				)
				SELECT COUNT(*) AS 'TotalRows' FROM (
					SELECT ROW_NUMBER() OVER (ORDER BY
							CASE WHEN (@SortColumn = 'PartNumber' AND @SortDirection='ASC')
								THEN PartNumber
							END ASC,
							CASE WHEN (@SortColumn = 'PartNumber' AND @SortDirection='DESC')
								THEN PartNumber
							END DESC,
							
							CASE WHEN (@SortColumn = 'PrinceRevision' AND @SortDirection='ASC')
								THEN PrinceRevision
							END ASC,
							CASE WHEN (@SortColumn = 'PrinceRevision' AND @SortDirection='DESC')
								THEN PrinceRevision
							END DESC,
							
							CASE WHEN (@SortColumn = 'ItemDescription' AND @SortDirection='ASC')
								THEN ItemDescription
							END ASC,
							CASE WHEN (@SortColumn = 'ItemDescription' AND @SortDirection='DESC')
								THEN ItemDescription
							END DESC,
														
							CASE WHEN (@SortColumn = 'MaterialType' AND @SortDirection='ASC')
								THEN MaterialType
							END ASC,
							CASE WHEN (@SortColumn = 'MaterialType' AND @SortDirection='DESC')
								THEN MaterialType
							END DESC,
							
							CASE WHEN (@SortColumn = 'FinishType' AND @SortDirection='ASC')
								THEN FinishType
							END ASC,
							CASE WHEN (@SortColumn = 'FinishType' AND @SortDirection='DESC')
								THEN FinishType
							END DESC,
							
							CASE WHEN (@SortColumn = 'PartDiameter' AND @SortDirection='ASC')
								THEN PartDiameter
							END ASC,
							CASE WHEN (@SortColumn = 'PartDiameter' AND @SortDirection='DESC')
								THEN PartDiameter
							END DESC,
							
							CASE WHEN (@SortColumn = 'PartLength' AND @SortDirection='ASC')
								THEN PartLength
							END ASC,
							CASE WHEN (@SortColumn = 'PartLength' AND @SortDirection='DESC')
								THEN PartLength
							END DESC,
							
							CASE WHEN (@SortColumn = 'Hardened' AND @SortDirection='ASC')
								THEN Hardened
							END ASC,
							CASE WHEN (@SortColumn = 'Hardened' AND @SortDirection='DESC')
								THEN Hardened
							END DESC,
							
							CASE WHEN (@SortColumn = 'OtherInfo' AND @SortDirection='ASC')
								THEN OtherInfo
							END ASC,
							CASE WHEN (@SortColumn = 'OtherInfo' AND @SortDirection='DESC')
								THEN OtherInfo
							END DESC,
							
							CASE WHEN (@SortColumn = 'NextAssembly' AND @SortDirection='ASC')
								THEN NextAssembly
							END ASC,
							CASE WHEN (@SortColumn = 'NextAssembly' AND @SortDirection='DESC')
								THEN NextAssembly
							END DESC,
							
							CASE WHEN (@SortColumn = 'PPapRequired' AND @SortDirection='ASC')
								THEN PPapRequired
							END ASC,
							CASE WHEN (@SortColumn = 'PPapRequired' AND @SortDirection='DESC')
								THEN PPapRequired
							END DESC,							
							
							CASE WHEN (@SortColumn = 'DateEntered' AND @SortDirection='ASC')
								THEN DateEntered
							END ASC,
							CASE WHEN (@SortColumn = 'DateEntered' AND @SortDirection='DESC')
								THEN DateEntered
							END DESC
						) AS 'RowNum',
						PartNumber, PrinceRevision, ItemDescription, MaterialType, FinishType, PartDiameter, PartLength, Hardened, OtherInfo, NextAssembly, PPapRequired, DateEntered
					FROM HistorySetA
					WHERE
						(
							((PATINDEX('%{%',@local_PartNumber) <> 0 and PartNumber >= SUBSTRING(@local_PartNumber, 0, PATINDEX('%{%',@local_PartNumber)) AND PartNumber <= SUBSTRING(@local_PartNumber, PATINDEX('%{%',@local_PartNumber) + 1, LEN(@local_PartNumber)))
							OR (@local_PartNumber IS NULL OR PartNumber LIKE @local_PartNumber))
						)
						AND (
							((PATINDEX('%{%',@local_PrinceRevision) <> 0 and PrinceRevision >= SUBSTRING(@local_PrinceRevision, 0, PATINDEX('%{%',@local_PrinceRevision)) AND PrinceRevision <= SUBSTRING(@local_PrinceRevision, PATINDEX('%{%',@local_PrinceRevision) + 1, LEN(@local_PrinceRevision)))
							OR (@local_PrinceRevision IS NULL OR PrinceRevision LIKE @local_PrinceRevision))
						)
						AND (
							((PATINDEX('%{%',@local_ItemDescription) <> 0 and ItemDescription >= SUBSTRING(@local_ItemDescription, 0, PATINDEX('%{%',@local_ItemDescription)) AND ItemDescription <= SUBSTRING(@local_ItemDescription, PATINDEX('%{%',@local_ItemDescription) + 1, LEN(@local_ItemDescription)))
							OR (@local_ItemDescription IS NULL OR ItemDescription LIKE @local_ItemDescription))
						)
						AND (
							((PATINDEX('%{%',@local_MaterialType) <> 0 and MaterialType >= SUBSTRING(@local_MaterialType, 0, PATINDEX('%{%',@local_MaterialType)) AND MaterialType <= SUBSTRING(@local_MaterialType, PATINDEX('%{%',@local_MaterialType) + 1, LEN(@local_MaterialType)))
							OR (@local_MaterialType IS NULL OR MaterialType LIKE @local_MaterialType))
						)
						AND (
							((PATINDEX('%{%',@local_FinishType) <> 0 and FinishType >= SUBSTRING(@local_FinishType, 0, PATINDEX('%{%',@local_FinishType)) AND FinishType <= SUBSTRING(@local_FinishType, PATINDEX('%{%',@local_FinishType) + 1, LEN(@local_FinishType)))
							OR (@local_FinishType IS NULL OR FinishType LIKE @local_FinishType))
						)
						AND (
							((PATINDEX('%{%',@local_PartDiameter) <> 0 and PartDiameter >= SUBSTRING(@local_PartDiameter, 0, PATINDEX('%{%',@local_PartDiameter)) AND PartDiameter <= SUBSTRING(@local_PartDiameter, PATINDEX('%{%',@local_PartDiameter) + 1, LEN(@local_PartDiameter)))
							OR (@local_PartDiameter IS NULL OR PartDiameter LIKE @local_PartDiameter))
						)
						AND (
							((PATINDEX('%{%',@local_PartLength) <> 0 and PartLength >= SUBSTRING(@local_PartLength, 0, PATINDEX('%{%',@local_PartLength)) AND PartLength <= SUBSTRING(@local_PartLength, PATINDEX('%{%',@local_PartLength) + 1, LEN(@local_PartLength)))
							OR (@local_PartLength IS NULL OR PartLength LIKE @local_PartLength))
						)
						AND (
							((PATINDEX('%{%',@local_Hardened) <> 0 and Hardened >= SUBSTRING(@local_Hardened, 0, PATINDEX('%{%',@local_Hardened)) AND Hardened <= SUBSTRING(@local_Hardened, PATINDEX('%{%',@local_Hardened) + 1, LEN(@local_Hardened)))
							OR (@local_Hardened IS NULL OR Hardened LIKE @local_Hardened))
						)
						AND (
							((PATINDEX('%{%',@local_OtherInfo) <> 0 and OtherInfo >= SUBSTRING(@local_OtherInfo, 0, PATINDEX('%{%',@local_OtherInfo)) AND OtherInfo <= SUBSTRING(@local_OtherInfo, PATINDEX('%{%',@local_OtherInfo) + 1, LEN(@local_OtherInfo)))
							OR (@local_OtherInfo IS NULL OR OtherInfo LIKE @local_OtherInfo))
						)
						AND (
							((PATINDEX('%{%',@local_NextAssembly) <> 0 and NextAssembly >= SUBSTRING(@local_NextAssembly, 0, PATINDEX('%{%',@local_NextAssembly)) AND NextAssembly <= SUBSTRING(@local_NextAssembly, PATINDEX('%{%',@local_NextAssembly) + 1, LEN(@local_NextAssembly)))
							OR (@local_NextAssembly IS NULL OR NextAssembly LIKE @local_NextAssembly))
						)
						AND (
							((PATINDEX('%{%',@local_PPapRequired) <> 0 and PPapRequired >= SUBSTRING(@local_PPapRequired, 0, PATINDEX('%{%',@local_PPapRequired)) AND PPapRequired <= SUBSTRING(@local_PPapRequired, PATINDEX('%{%',@local_PPapRequired) + 1, LEN(@local_PPapRequired)))
							OR (@local_PPapRequired IS NULL OR PPapRequired LIKE @local_PPapRequired))
						)					
						AND (@local_DateEntered IS NULL OR DateEntered LIKE @local_DateEntered)
				) AS HistorySetB;
			END
		ELSE
			BEGIN	  
				DECLARE @offset INT
				DECLARE @newsize INT
				
				IF (@Page=1)
				   BEGIN
						SET @offset = @Page
						SET @newsize = @Size-1
				   END
				ELSE 
					BEGIN
						SET @offset = ((@Page*@Size)-@Size) + 1
						SET @newsize = @Size-1
					END
						
				SET NOCOUNT ON;
				
				WITH HistorySetA AS
				(
					SELECT * FROM dbo.tbl_SampleTable
				)
				SELECT * FROM (
					SELECT ROW_NUMBER() OVER (ORDER BY
							CASE WHEN (@SortColumn = 'PartNumber' AND @SortDirection='ASC')
								THEN PartNumber
							END ASC,
							CASE WHEN (@SortColumn = 'PartNumber' AND @SortDirection='DESC')
								THEN PartNumber
							END DESC,
							
							CASE WHEN (@SortColumn = 'PrinceRevision' AND @SortDirection='ASC')
								THEN PrinceRevision
							END ASC,
							CASE WHEN (@SortColumn = 'PrinceRevision' AND @SortDirection='DESC')
								THEN PrinceRevision
							END DESC,
							
							CASE WHEN (@SortColumn = 'ItemDescription' AND @SortDirection='ASC')
								THEN ItemDescription
							END ASC,
							CASE WHEN (@SortColumn = 'ItemDescription' AND @SortDirection='DESC')
								THEN ItemDescription
							END DESC,
														
							CASE WHEN (@SortColumn = 'MaterialType' AND @SortDirection='ASC')
								THEN MaterialType
							END ASC,
							CASE WHEN (@SortColumn = 'MaterialType' AND @SortDirection='DESC')
								THEN MaterialType
							END DESC,
							
							CASE WHEN (@SortColumn = 'FinishType' AND @SortDirection='ASC')
								THEN FinishType
							END ASC,
							CASE WHEN (@SortColumn = 'FinishType' AND @SortDirection='DESC')
								THEN FinishType
							END DESC,
							
							CASE WHEN (@SortColumn = 'PartDiameter' AND @SortDirection='ASC')
								THEN PartDiameter
							END ASC,
							CASE WHEN (@SortColumn = 'PartDiameter' AND @SortDirection='DESC')
								THEN PartDiameter
							END DESC,
							
							CASE WHEN (@SortColumn = 'PartLength' AND @SortDirection='ASC')
								THEN PartLength
							END ASC,
							CASE WHEN (@SortColumn = 'PartLength' AND @SortDirection='DESC')
								THEN PartLength
							END DESC,
							
							CASE WHEN (@SortColumn = 'Hardened' AND @SortDirection='ASC')
								THEN Hardened
							END ASC,
							CASE WHEN (@SortColumn = 'Hardened' AND @SortDirection='DESC')
								THEN Hardened
							END DESC,
							
							CASE WHEN (@SortColumn = 'OtherInfo' AND @SortDirection='ASC')
								THEN OtherInfo
							END ASC,
							CASE WHEN (@SortColumn = 'OtherInfo' AND @SortDirection='DESC')
								THEN OtherInfo
							END DESC,
							
							CASE WHEN (@SortColumn = 'NextAssembly' AND @SortDirection='ASC')
								THEN NextAssembly
							END ASC,
							CASE WHEN (@SortColumn = 'NextAssembly' AND @SortDirection='DESC')
								THEN NextAssembly
							END DESC,
							
							CASE WHEN (@SortColumn = 'PPapRequired' AND @SortDirection='ASC')
								THEN PPapRequired
							END ASC,
							CASE WHEN (@SortColumn = 'PPapRequired' AND @SortDirection='DESC')
								THEN PPapRequired
							END DESC,							
							
							CASE WHEN (@SortColumn = 'DateEntered' AND @SortDirection='ASC')
								THEN DateEntered
							END ASC,
							CASE WHEN (@SortColumn = 'DateEntered' AND @SortDirection='DESC')
								THEN DateEntered
							END DESC
						) AS 'RowNum',
						PartNumber, PrinceRevision, ItemDescription, MaterialType, FinishType, PartDiameter, PartLength, Hardened, OtherInfo, NextAssembly, PPapRequired, DateEntered
					FROM HistorySetA
					WHERE
						(
							((PATINDEX('%{%',@local_PartNumber) <> 0 and PartNumber >= SUBSTRING(@local_PartNumber, 0, PATINDEX('%{%',@local_PartNumber)) AND PartNumber <= SUBSTRING(@local_PartNumber, PATINDEX('%{%',@local_PartNumber) + 1, LEN(@local_PartNumber)))
							OR (@local_PartNumber IS NULL OR PartNumber LIKE @local_PartNumber))
						)
						AND (
							((PATINDEX('%{%',@local_PrinceRevision) <> 0 and PrinceRevision >= SUBSTRING(@local_PrinceRevision, 0, PATINDEX('%{%',@local_PrinceRevision)) AND PrinceRevision <= SUBSTRING(@local_PrinceRevision, PATINDEX('%{%',@local_PrinceRevision) + 1, LEN(@local_PrinceRevision)))
							OR (@local_PrinceRevision IS NULL OR PrinceRevision LIKE @local_PrinceRevision))
						)
						AND (
							((PATINDEX('%{%',@local_ItemDescription) <> 0 and ItemDescription >= SUBSTRING(@local_ItemDescription, 0, PATINDEX('%{%',@local_ItemDescription)) AND ItemDescription <= SUBSTRING(@local_ItemDescription, PATINDEX('%{%',@local_ItemDescription) + 1, LEN(@local_ItemDescription)))
							OR (@local_ItemDescription IS NULL OR ItemDescription LIKE @local_ItemDescription))
						)
						AND (
							((PATINDEX('%{%',@local_MaterialType) <> 0 and MaterialType >= SUBSTRING(@local_MaterialType, 0, PATINDEX('%{%',@local_MaterialType)) AND MaterialType <= SUBSTRING(@local_MaterialType, PATINDEX('%{%',@local_MaterialType) + 1, LEN(@local_MaterialType)))
							OR (@local_MaterialType IS NULL OR MaterialType LIKE @local_MaterialType))
						)
						AND (
							((PATINDEX('%{%',@local_FinishType) <> 0 and FinishType >= SUBSTRING(@local_FinishType, 0, PATINDEX('%{%',@local_FinishType)) AND FinishType <= SUBSTRING(@local_FinishType, PATINDEX('%{%',@local_FinishType) + 1, LEN(@local_FinishType)))
							OR (@local_FinishType IS NULL OR FinishType LIKE @local_FinishType))
						)
						AND (
							((PATINDEX('%{%',@local_PartDiameter) <> 0 and PartDiameter >= SUBSTRING(@local_PartDiameter, 0, PATINDEX('%{%',@local_PartDiameter)) AND PartDiameter <= SUBSTRING(@local_PartDiameter, PATINDEX('%{%',@local_PartDiameter) + 1, LEN(@local_PartDiameter)))
							OR (@local_PartDiameter IS NULL OR PartDiameter LIKE @local_PartDiameter))
						)
						AND (
							((PATINDEX('%{%',@local_PartLength) <> 0 and PartLength >= SUBSTRING(@local_PartLength, 0, PATINDEX('%{%',@local_PartLength)) AND PartLength <= SUBSTRING(@local_PartLength, PATINDEX('%{%',@local_PartLength) + 1, LEN(@local_PartLength)))
							OR (@local_PartLength IS NULL OR PartLength LIKE @local_PartLength))
						)
						AND (
							((PATINDEX('%{%',@local_Hardened) <> 0 and Hardened >= SUBSTRING(@local_Hardened, 0, PATINDEX('%{%',@local_Hardened)) AND Hardened <= SUBSTRING(@local_Hardened, PATINDEX('%{%',@local_Hardened) + 1, LEN(@local_Hardened)))
							OR (@local_Hardened IS NULL OR Hardened LIKE @local_Hardened))
						)
						AND (
							((PATINDEX('%{%',@local_OtherInfo) <> 0 and OtherInfo >= SUBSTRING(@local_OtherInfo, 0, PATINDEX('%{%',@local_OtherInfo)) AND OtherInfo <= SUBSTRING(@local_OtherInfo, PATINDEX('%{%',@local_OtherInfo) + 1, LEN(@local_OtherInfo)))
							OR (@local_OtherInfo IS NULL OR OtherInfo LIKE @local_OtherInfo))
						)
						AND (
							((PATINDEX('%{%',@local_NextAssembly) <> 0 and NextAssembly >= SUBSTRING(@local_NextAssembly, 0, PATINDEX('%{%',@local_NextAssembly)) AND NextAssembly <= SUBSTRING(@local_NextAssembly, PATINDEX('%{%',@local_NextAssembly) + 1, LEN(@local_NextAssembly)))
							OR (@local_NextAssembly IS NULL OR NextAssembly LIKE @local_NextAssembly))
						)
						AND (
							((PATINDEX('%{%',@local_PPapRequired) <> 0 and PPapRequired >= SUBSTRING(@local_PPapRequired, 0, PATINDEX('%{%',@local_PPapRequired)) AND PPapRequired <= SUBSTRING(@local_PPapRequired, PATINDEX('%{%',@local_PPapRequired) + 1, LEN(@local_PPapRequired)))
							OR (@local_PPapRequired IS NULL OR PPapRequired LIKE @local_PPapRequired))
						)					
						AND (@local_DateEntered IS NULL OR DateEntered LIKE @local_DateEntered)
				) AS HistorySetB
				WHERE HistorySetB.[RowNum] BETWEEN CONVERT(NVARCHAR(12), @offset) AND CONVERT(NVARCHAR(12), (@offset + @newsize));
			END
END

GO


