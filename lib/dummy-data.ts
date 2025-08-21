// Dummy data for development - replace with real Google Drive API calls
export interface DriveFile {
  id: string
  name: string
  mimeType: string
  size: number
  modifiedTime: string
  webViewLink: string
  webContentLink: string
}

export const DUMMY_FOLDER_ID = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"

export const DUMMY_FILES: DriveFile[] = [
  {
    id: "1",
    name: "Project Proposal.pdf",
    mimeType: "application/pdf",
    size: 2048576,
    modifiedTime: "2024-01-15T10:30:00Z",
    webViewLink: "https://drive.google.com/file/d/1/view",
    webContentLink: "https://drive.google.com/uc?id=1&export=download",
  },
  {
    id: "2",
    name: "Budget Spreadsheet.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    size: 1024000,
    modifiedTime: "2024-01-14T15:45:00Z",
    webViewLink: "https://drive.google.com/file/d/2/view",
    webContentLink: "https://drive.google.com/uc?id=2&export=download",
  },
  {
    id: "3",
    name: "Team Photo.jpg",
    mimeType: "image/jpeg",
    size: 3145728,
    modifiedTime: "2024-01-13T09:20:00Z",
    webViewLink: "https://drive.google.com/file/d/3/view",
    webContentLink: "https://drive.google.com/uc?id=3&export=download",
  },
  {
    id: "4",
    name: "Meeting Notes.docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size: 512000,
    modifiedTime: "2024-01-12T14:10:00Z",
    webViewLink: "https://drive.google.com/file/d/4/view",
    webContentLink: "https://drive.google.com/uc?id=4&export=download",
  },
  {
    id: "5",
    name: "Presentation.pptx",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    size: 4194304,
    modifiedTime: "2024-01-11T11:30:00Z",
    webViewLink: "https://drive.google.com/file/d/5/view",
    webContentLink: "https://drive.google.com/uc?id=5&export=download",
  },
]

// Dummy authentication state
export const DUMMY_USER = {
  id: "user123",
  name: "John Doe",
  email: "john.doe@example.com",
  picture: "https://via.placeholder.com/40",
}

// Simulate API delay
export const simulateApiDelay = (ms = 1500) => new Promise((resolve) => setTimeout(resolve, ms))

// Simulate file fetch from Google Drive
export const fetchDriveFiles = async (folderId: string): Promise<DriveFile[]> => {
  await simulateApiDelay()
  console.log(`[v0] Fetching files from folder: ${folderId}`)
  return DUMMY_FILES
}

// Simulate file upload to Google Drive
export const uploadFileToDrive = async (
  file: File,
  folderId: string,
  onProgress?: (progress: number) => void,
): Promise<DriveFile> => {
  console.log(`[v0] Starting upload of ${file.name} to folder: ${folderId}`)

  // Simulate upload progress
  for (let progress = 0; progress <= 100; progress += 10) {
    await new Promise((resolve) => setTimeout(resolve, 200))
    onProgress?.(progress)
  }

  const newFile: DriveFile = {
    id: Date.now().toString(),
    name: file.name,
    mimeType: file.type,
    size: file.size,
    modifiedTime: new Date().toISOString(),
    webViewLink: `https://drive.google.com/file/d/${Date.now()}/view`,
    webContentLink: `https://drive.google.com/uc?id=${Date.now()}&export=download`,
  }

  console.log(`[v0] Upload completed: ${file.name}`)
  return newFile
}
