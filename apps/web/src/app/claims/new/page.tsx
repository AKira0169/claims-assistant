import { ClaimWizard } from './components/ClaimWizard';

export default function NewClaimPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">New Claim</h2>
        <p className="text-gray-500 text-sm mt-1">
          Fill in the claim details or use AI to extract information from a description.
        </p>
      </div>
      <ClaimWizard />
    </div>
  );
}
