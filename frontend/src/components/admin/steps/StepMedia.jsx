'use client'
import ImageUploader from '@/components/ui/ImageUploader'
import MediaUploader from '@/components/admin/MediaUploader'

export default function StepMedia({ watch, setValue, initialImages, videoUrl, documentUrl }) {
  return (
    <div className="space-y-8">

      {/* ── Fotos ─────────────────────────────────────── */}
      <section>
        <div className="mb-3">
          <h3 className="text-[11px] uppercase tracking-[0.13em] font-bold text-sand-muted/80">
            Fotos de la propiedad
          </h3>
          <p className="text-[11px] text-sand-muted/50 mt-0.5">
            La primera imagen será la portada. Arrastra para reordenar.
          </p>
        </div>
        <ImageUploader
          initialImages={initialImages || []}
          onChange={imgs => setValue('images', imgs, { shouldDirty: true })}
        />
      </section>

      {/* ── Video ─────────────────────────────────────── */}
      <section>
        <div className="mb-3">
          <h3 className="text-[11px] uppercase tracking-[0.13em] font-bold text-sand-muted/80">
            Video de la propiedad
          </h3>
          <p className="text-[11px] text-sand-muted/50 mt-0.5">
            Sube directamente desde tu dispositivo (MP4, MOV, WEBM). Se guarda en Cloudinary.
          </p>
        </div>
        <MediaUploader
          value={videoUrl ?? ''}
          onChange={url => setValue('videoUrl', url, { shouldDirty: true })}
          accept="video/*"
          mode="video"
          maxMB={200}
        />
      </section>

      {/* ── Documento PDF ─────────────────────────────── */}
      <section>
        <div className="mb-3">
          <h3 className="text-[11px] uppercase tracking-[0.13em] font-bold text-sand-muted/80">
            Documento (planos, escritura, brochure)
          </h3>
          <p className="text-[11px] text-sand-muted/50 mt-0.5">
            PDF hasta 20 MB. Visible solo para el equipo interno.
          </p>
        </div>
        <MediaUploader
          value={documentUrl ?? ''}
          onChange={url => setValue('documentUrl', url, { shouldDirty: true })}
          accept="application/pdf"
          mode="pdf"
          maxMB={20}
        />
      </section>

    </div>
  )
}
