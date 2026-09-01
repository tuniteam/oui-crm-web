import { useRef, useState } from 'react';
import { AlertCircle, Download, FileUp, ImageUp } from 'lucide-react';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DOCUMENTS_UI } from '../../constants/constants';
import { documentsService } from '../../services/documents.service';
import {
  useSettingsDocuments,
  useUploadSignature,
  useUploadTemplate,
} from '../../hooks/useSettingsDocuments';
import {
  TEMPLATE_TYPE,
  type DocumentTemplate,
  type TemplateType,
} from '../../types/documents';

const UI = DOCUMENTS_UI;

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('fr-FR');
}

/** Choix de fichier declenche par un bouton : l'input reste masque. */
function useFilePicker(onPick: (file: File) => void) {
  const ref = useRef<HTMLInputElement>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reinitialise la valeur : sans cela, re-choisir le meme fichier apres une
    // correction ne declencherait aucun evenement.
    e.target.value = '';
    if (file) onPick(file);
  };

  return { ref, onChange, open: () => ref.current?.click() };
}

function TemplateRow({
  type,
  label,
  template,
  canUpdate,
}: {
  type: TemplateType;
  label: string;
  template?: DocumentTemplate;
  canUpdate: boolean;
}) {
  const { upload, loading } = useUploadTemplate();
  const [invalidDetails, setInvalidDetails] = useState<string[]>([]);

  const picker = useFilePicker(async (file) => {
    setInvalidDetails([]);
    const result = await upload(type, file);
    if (!result.ok) setInvalidDetails(result.details);
  });

  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <div className="flex flex-wrap items-center gap-3">
        <div className="grow">
          <div className="flex items-center gap-2">
            <span className="font-medium">{label}</span>
            {template ? (
              <Badge variant="success" appearance="light" size="sm">
                {UI.TEMPLATES.VERSION(template.version)}
              </Badge>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            {template
              ? `${template.fileName} · ${UI.TEMPLATES.UPLOADED_AT(formatDate(template.uploadedAt))}`
              : UI.TEMPLATES.NONE}
          </p>
        </div>

        {template ? (
          <Button variant="outline" size="sm" asChild>
            <a
              href={documentsService.downloadUrl(template.fileId)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {UI.TEMPLATES.DOWNLOAD}
            </a>
          </Button>
        ) : null}

        {canUpdate ? (
          <>
            <input
              ref={picker.ref}
              type="file"
              accept={UI.TEMPLATES.ACCEPT}
              className="hidden"
              onChange={picker.onChange}
              data-testid={`template-input-${type}`}
            />
            <Button size="sm" disabled={loading} onClick={picker.open}>
              <FileUp className="h-4 w-4" aria-hidden="true" />
              {template ? UI.TEMPLATES.REPLACE : UI.TEMPLATES.UPLOAD}
            </Button>
          </>
        ) : null}
      </div>

      {/* Les balises manquantes restent affichees : c'est la seule information
          qui permette de corriger le fichier. */}
      {invalidDetails.length > 0 && (
        <Alert variant="destructive" appearance="light" className="mt-3">
          <AlertIcon>
            <AlertCircle />
          </AlertIcon>
          <div>
            <AlertTitle>{UI.TEMPLATES.INVALID_TITLE}</AlertTitle>
            <p className="mt-1 text-xs">{UI.TEMPLATES.INVALID_HINT}</p>
            <ul className="mt-2 list-disc ps-5 text-xs">
              {invalidDetails.map((detail) => (
                <li key={detail} className="font-mono">
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        </Alert>
      )}
    </div>
  );
}

export function DocumentsPane({ canUpdate }: { canUpdate: boolean }) {
  const { documents, loading } = useSettingsDocuments();
  const { upload: uploadSignature, loading: signatureLoading } =
    useUploadSignature();

  const signaturePicker = useFilePicker((file) => {
    void uploadSignature(file);
  });

  if (loading || !documents) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          {UI.NUMBERING.TITLE}…
        </CardContent>
      </Card>
    );
  }

  const byType = (type: TemplateType) =>
    documents.templates.find((t) => t.type === type);

  const numbering = [
    { label: UI.NUMBERING.QUOTE, value: documents.numbering.quote },
    { label: UI.NUMBERING.CONTRACT, value: documents.numbering.contract },
    { label: UI.NUMBERING.INVOICE, value: documents.numbering.invoice },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-base font-semibold">{UI.NUMBERING.TITLE}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {UI.NUMBERING.DESCRIPTION}
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {numbering.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-border bg-muted/30 px-4 py-3"
              >
                <span className="text-xs text-muted-foreground">
                  {item.label}
                </span>
                <b className="mt-0.5 block font-mono text-sm">{item.value}</b>
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            {UI.NUMBERING.NOTE}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {UI.NUMBERING.READ_ONLY}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-base font-semibold">{UI.TEMPLATES.TITLE}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {UI.TEMPLATES.DESCRIPTION}
          </p>

          <div className="mt-3">
            <TemplateRow
              type={TEMPLATE_TYPE.QUOTE}
              label={UI.TEMPLATES.QUOTE}
              template={byType(TEMPLATE_TYPE.QUOTE)}
              canUpdate={canUpdate}
            />
            <TemplateRow
              type={TEMPLATE_TYPE.CONTRACT}
              label={UI.TEMPLATES.CONTRACT}
              template={byType(TEMPLATE_TYPE.CONTRACT)}
              canUpdate={canUpdate}
            />
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            {UI.TEMPLATES.MAX_SIZE_HINT}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-base font-semibold">{UI.SIGNATURE.TITLE}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {UI.SIGNATURE.DESCRIPTION}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            {documents.signatureImage ? (
              <img
                src={documentsService.downloadUrl(
                  documents.signatureImage.fileId,
                )}
                alt={documents.signatureImage.fileName}
                className="h-20 w-auto rounded border border-border bg-white p-2"
              />
            ) : (
              <span className="text-sm text-muted-foreground">
                {UI.SIGNATURE.NONE}
              </span>
            )}

            {canUpdate ? (
              <>
                <input
                  ref={signaturePicker.ref}
                  type="file"
                  accept={UI.SIGNATURE.ACCEPT}
                  className="hidden"
                  onChange={signaturePicker.onChange}
                  data-testid="signature-input"
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={signatureLoading}
                  onClick={signaturePicker.open}
                >
                  <ImageUp className="h-4 w-4" aria-hidden="true" />
                  {documents.signatureImage
                    ? UI.SIGNATURE.REPLACE
                    : UI.SIGNATURE.UPLOAD}
                </Button>
              </>
            ) : null}
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            {UI.SIGNATURE.MAX_SIZE_HINT}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
