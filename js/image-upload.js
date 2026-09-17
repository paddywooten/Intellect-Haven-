/**
 * Intellect Haven - Image Upload System
 * Handles profile photo and document uploads to Firebase Storage
 */

/**
 * Upload image to Firebase Storage
 * @param {File} file - File object to upload
 * @param {string} path - Storage path (e.g., 'teachers/userId/profile.jpg')
 * @param {function} onProgress - Progress callback (optional)
 * @returns {Promise} - Promise resolving to download URL
 */
async function uploadImage(file, path, onProgress = null) {
    return new Promise((resolve, reject) => {
        // Validate file
        const validation = validateImageFile(file);
        if (!validation.valid) {
            reject(new Error(validation.error));
            return;
        }
        
        // Create storage reference
        const storageRef = firebaseStorage.ref();
        const fileRef = storageRef.child(path);
        
        // Upload file
        const uploadTask = fileRef.put(file);
        
        // Monitor upload progress
        uploadTask.on('state_changed',
            (snapshot) => {
                // Progress
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) {
                    onProgress(progress);
                }
            },
            (error) => {
                // Error
                console.error('Upload error:', error);
                reject(error);
            },
            () => {
                // Complete
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    resolve(downloadURL);
                }).catch(reject);
            }
        );
    });
}

/**
 * Validate image file
 * @param {File} file - File to validate
 * @returns {object} - Validation result {valid: boolean, error: string}
 */
function validateImageFile(file) {
    // Check if file exists
    if (!file) {
        return { valid: false, error: 'No file selected' };
    }
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        return { valid: false, error: 'Invalid file type. Please upload JPG, PNG, or WebP images.' };
    }
    
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        return { valid: false, error: 'File too large. Maximum size is 5MB.' };
    }
    
    return { valid: true };
}

/**
 * Upload document (PDF, etc.) to Firebase Storage
 * @param {File} file - File object to upload
 * @param {string} path - Storage path
 * @param {function} onProgress - Progress callback (optional)
 * @returns {Promise} - Promise resolving to download URL
 */
async function uploadDocument(file, path, onProgress = null) {
    return new Promise((resolve, reject) => {
        // Validate file
        const validation = validateDocumentFile(file);
        if (!validation.valid) {
            reject(new Error(validation.error));
            return;
        }
        
        // Create storage reference
        const storageRef = firebaseStorage.ref();
        const fileRef = storageRef.child(path);
        
        // Upload file
        const uploadTask = fileRef.put(file);
        
        // Monitor upload progress
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) {
                    onProgress(progress);
                }
            },
            (error) => {
                console.error('Upload error:', error);
                reject(error);
            },
            () => {
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    resolve(downloadURL);
                }).catch(reject);
            }
        );
    });
}

/**
 * Validate document file
 * @param {File} file - File to validate
 * @returns {object} - Validation result
 */
function validateDocumentFile(file) {
    if (!file) {
        return { valid: false, error: 'No file selected' };
    }
    
    // Check file type
    const validTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png'
    ];
    if (!validTypes.includes(file.type)) {
        return { valid: false, error: 'Invalid file type. Please upload PDF or image files.' };
    }
    
    // Check file size (max 10MB for documents)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        return { valid: false, error: 'File too large. Maximum size is 10MB.' };
    }
    
    return { valid: true };
}

/**
 * Delete image from Firebase Storage
 * @param {string} url - Download URL of the image
 * @returns {Promise} - Promise resolving when deleted
 */
async function deleteImage(url) {
    try {
        // Get storage reference from URL
        const storageRef = firebaseStorage.refFromURL(url);
        await storageRef.delete();
        return { success: true };
    } catch (error) {
        console.error('Delete error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Compress image before upload
 * @param {File} file - Image file to compress
 * @param {number} maxWidth - Maximum width (default: 800)
 * @param {number} quality - JPEG quality 0-1 (default: 0.8)
 * @returns {Promise} - Promise resolving to compressed File
 */
function compressImage(file, maxWidth = 800, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const img = new Image();
            
            img.onload = function() {
                // Create canvas
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Calculate new dimensions
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw image on canvas
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to blob
                canvas.toBlob(
                    (blob) => {
                        // Create new file
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });
                        resolve(compressedFile);
                    },
                    'image/jpeg',
                    quality
                );
            };
            
            img.onerror = reject;
            img.src = e.target.result;
        };
        
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Create image preview
 * @param {File} file - Image file
 * @returns {Promise} - Promise resolving to data URL
 */
function createImagePreview(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            resolve(e.target.result);
        };
        
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Generate unique filename
 * @param {string} userId - User ID
 * @param {string} type - File type (profile, verification, etc.)
 * @param {string} extension - File extension
 * @returns {string} - Unique filename
 */
function generateFilename(userId, type, extension) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${userId}/${type}_${timestamp}_${random}.${extension}`;
}

/**
 * Upload teacher profile photo
 * @param {File} file - Image file
 * @param {string} userId - Teacher's user ID
 * @param {function} onProgress - Progress callback
 * @returns {Promise} - Promise resolving to download URL
 */
async function uploadTeacherProfilePhoto(file, userId, onProgress = null) {
    try {
        // Compress image
        const compressed = await compressImage(file, 800, 0.85);
        
        // Generate filename
        const extension = 'jpg';
        const filename = generateFilename(userId, 'profile', extension);
        const path = `teachers/${filename}`;
        
        // Upload
        const url = await uploadImage(compressed, path, onProgress);
        
        return { success: true, url: url };
    } catch (error) {
        console.error('Profile photo upload error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Upload teacher verification document
 * @param {File} file - Document file
 * @param {string} userId - Teacher's user ID
 * @param {string} docType - Document type (id, qualification, reference)
 * @param {function} onProgress - Progress callback
 * @returns {Promise} - Promise resolving to download URL
 */
async function uploadVerificationDocument(file, userId, docType, onProgress = null) {
    try {
        // Get file extension
        const extension = file.type === 'application/pdf' ? 'pdf' : 'jpg';
        const filename = generateFilename(userId, docType, extension);
        const path = `teachers/${userId}/verification/${filename}`;
        
        // Upload
        const url = await uploadDocument(file, path, onProgress);
        
        return { success: true, url: url };
    } catch (error) {
        console.error('Document upload error:', error);
        return { success: false, error: error.message };
    }
}

// Export for use in other files
window.ImageUpload = {
    uploadImage,
    uploadDocument,
    deleteImage,
    compressImage,
    createImagePreview,
    validateImageFile,
    validateDocumentFile,
    uploadTeacherProfilePhoto,
    uploadVerificationDocument,
    generateFilename
};
