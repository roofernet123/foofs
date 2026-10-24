import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 1. Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Read uploaded file
    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'No valid file provided' },
        { status: 400 }
      )
    }

    // 3. Validate extension
    const extension =
      file.name.split('.').pop()?.toLowerCase() || ''

    const allowedExtensions = [
      'pdf',
      'jpg',
      'jpeg',
      'png',
      'webp',
      'doc',
      'docx',
    ]

    if (!allowedExtensions.includes(extension)) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${file.name}`,
        },
        { status: 400 }
      )
    }

    // 4. Validate MIME type
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]

    if (
      file.type &&
      !allowedMimeTypes.includes(file.type)
    ) {
      return NextResponse.json(
        {
          error: `Unsupported MIME type: ${file.type}`,
        },
        { status: 400 }
      )
    }

    // 5. Validate size - 5 MB
    const maxSize = 5 * 1024 * 1024

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: 'File must be smaller than 5MB',
        },
        { status: 400 }
      )
    }

    // 6. Store each user's documents inside their own folder
    const filePath =
      `${user.id}/${crypto.randomUUID()}.${extension}`

    console.log('Uploading claim document:', {
      userId: user.id,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      filePath,
    })

    // 7. Upload to Supabase Storage
    const { data, error: uploadError } =
      await supabase.storage
        .from('claim-documents')
        .upload(filePath, file, {
          contentType:
            file.type || 'application/octet-stream',
          upsert: false,
        })

    if (uploadError) {
      console.error(
        'Claim document upload error:',
        uploadError
      )

      return NextResponse.json(
        {
          error: uploadError.message,
        },
        { status: 500 }
      )
    }

    // IMPORTANT: successful upload MUST return a response
    return NextResponse.json(
      {
        success: true,
        path: data.path,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Upload route error:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to upload document',
      },
      { status: 500 }
    )
  }
}