'use client'
import ImageUploader from '@/components/ui/ImageUploader'
import MultiMediaUploader from '@/components/admin/MultiMediaUploader'

export default function StepMedia({ watch, setValue, initialImages, initialVideos, initialDocuments }) {
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

      {/* ── Videos ────────────────────────────────────── */}
      <section>
        <div className="mb-3">
          <h3 className="text-[11px] uppercase tracking-[0.13em] font-bold text-sand-muted/80">
            Videos de la propiedad
          </h3>
          <p className="text-[11px] text-sand-muted/50 mt-0.5">
            Sube uno o varios videos desde tu dispositivo (MP4, MOV, WEBM). Máx. 100 MB cada uno — límite del plan gratuito de Cloudinary. Se guardan en Cloudinary.
          </p>
        </div>
        <MultiMediaUploader
          initialItems={initialVideos || []}
          onChange={items => setValue('videos', items, { shouldDirty: true })}
          mode="video"
          maxMB={100}
          label="videos"
        />
      </section>

      {/* ── Documentos PDF ────────────────────────────── */}
      <section>
        <div className="mb-3">
          <h3 className="text-[11px] uppercase tracking-[0.13em] font-bold text-sand-muted/80">
            Documentos (planos, escritura, brochure)
          </h3>
          <p className="text-[11px] text-sand-muted/50 mt-0.5">
            Sube uno o varios PDF, hasta 20 MB cada uno. Visibles solo para el equipo interno.
          </p>
        </div>
        <MultiMediaUploader
          initialItems={initialDocuments || []}
          onChange={items => setValue('documents', items, { shouldDirty: true })}
          mode="pdf"
          maxMB={20}
          label="documentos"
        />
      </section>

    </div>
  )
}
