# Image uploads

The admin Gallery and Events pages upload images to `POST /api/gallery/upload`
using the existing JWT and `gallery.create` permission. Files are validated by
MIME type and file signature, assigned UUID filenames, and written to
`UPLOAD_DIR` (default: `server/storage/uploads`). Only relative `/media/...`
paths are stored in Supabase. The backend serves those generated paths through
`GET /media/:filename`.

Run the SQL in [`migrations/20261013_gallery_uploads.sql`](./migrations/20261013_gallery_uploads.sql)
against the existing Supabase project before uploading. It is idempotent and
does not create a second gallery or events system.

## Development

Copy `.env.example` to `.env`, provide the existing Supabase/JWT values, and
start the server with `npm run dev`. The default local directory is ignored by
Git.

## Production

The frontend currently targets `https://react-iic.onrender.com/api`, so
`PUBLIC_API_URL` should be set to the deployed backend origin (for example
`https://react-iic.onrender.com`). Render's default container filesystem is
ephemeral; configure a persistent disk mounted at a path such as
`/var/data/iic-uploads` and set `UPLOAD_DIR=/var/data/iic-uploads`. Without
that disk, uploaded files can be lost during a redeploy or instance restart.
No external image-hosting service is required.
