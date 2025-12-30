/\*\*

- INTEGRATION GUIDE: ImageUploadField Component
-
- Usage in your GunplaForm component:
  \*/

// 1. Add imports
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import ImageUploadField from '@/components/image-upload-field';

// 2. In your form component, add state for preview
const [imagePreview, setImagePreview] = useState<string | null>(null);

// 3. Update your form's watch effect to sync preview
watch((data) => {
if (data.image_url && typeof data.image_url === 'string') {
setImagePreview(data.image_url);
} else {
setImagePreview(null);
}
});

// 4. Place the component in your form JSX (after Notes, before ownership checkbox)
<>
{/_ ... existing form fields ... _/}

{/_ Notes textarea _/}

  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-200">Notes</label>
    <textarea
      {...register('notes')}
      className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white"
      rows={4}
    />
  </div>

{/_ IMAGE UPLOAD FIELD - INSERT HERE _/}
<ImageUploadField
    preview={imagePreview}
    setValue={setValue}
  />

{/_ Ownership checkbox _/}

  <div className="flex items-center gap-3">
    <input
      type="checkbox"
      {...register('owned')}
      className="h-4 w-4 rounded border-gray-600 bg-gray-700"
    />
    <label className="text-sm text-gray-300">I own this kit</label>
  </div>

{/_ ... rest of form ... _/}
</>

/\*\*

- KEY POINTS:
-
- 1.  The component stores preview as DataURL in 'image_url' field via setValue()
- 2.  For final submission, you'll need to:
- - Upload the base64 DataURL directly to Supabase Storage
- - OR convert to File and upload
- - Store the final public URL in database
-
- 3.  File validation:
- - Only image files (PNG, JPG, WebP, GIF)
- - Max 10MB
-
- 4.  Preview handling:
- - Shows immediately after selection
- - Remove button clears the preview
- - Drag-and-drop area hides when image is selected
-
- 5.  Schema update needed:
- - Add 'image_url' to your Zod schema if not already present
- - z.string().optional() or z.string().nullable()
    \*/
