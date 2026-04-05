import { ClaimWizard } from './components/ClaimWizard';

export default function NewClaimPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end gap-4">
        <h2 className="brutal-heading text-4xl">NEW CLAIM</h2>
        <div className="brutal-tag bg-brutal-yellow mb-1">5 Steps</div>
      </div>
      <p className="font-mono text-sm text-brutal-black/60">
        Fill in the details or let AI extract information from a description.
      </p>
      <ClaimWizard />
    </div>
  );
}
