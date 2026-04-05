'use client';

import { ClaimType, ClaimPriority } from '@claims-assistant/shared';
import { WizardFormData } from '../types';
import { AiBadge } from './AiBadge';

interface Step3Props {
  formData: WizardFormData;
  onUpdate: (updates: Partial<WizardFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const DETAIL_FIELDS: Record<string, { name: string; label: string }[]> = {
  [ClaimType.AUTO]: [
    { name: 'vehicleMake', label: 'Vehicle Make' },
    { name: 'vehicleModel', label: 'Vehicle Model' },
    { name: 'vehicleYear', label: 'Vehicle Year' },
    { name: 'licensePlate', label: 'License Plate' },
    { name: 'otherPartyName', label: 'Other Party Name' },
    { name: 'otherPartyInsurance', label: 'Other Party Insurance' },
    { name: 'policeReportNumber', label: 'Police Report #' },
    { name: 'accidentLocation', label: 'Accident Location' },
  ],
  [ClaimType.PROPERTY]: [
    { name: 'propertyAddress', label: 'Property Address' },
    { name: 'damageType', label: 'Damage Type' },
    { name: 'roomsAffected', label: 'Rooms Affected' },
    { name: 'propertyType', label: 'Property Type' },
  ],
  [ClaimType.HEALTH]: [
    { name: 'providerName', label: 'Provider Name' },
    { name: 'diagnosis', label: 'Diagnosis' },
    { name: 'treatmentDate', label: 'Treatment Date' },
    { name: 'treatmentType', label: 'Treatment Type' },
    { name: 'facilityName', label: 'Facility Name' },
  ],
};

function FieldGrid({ formData, onUpdateDetail, fields }: {
  formData: WizardFormData;
  onUpdateDetail: (k: string, v: string) => void;
  fields: { name: string; label: string }[];
}) {
  const details = formData.details as any;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map((f) => (
        <div key={f.name}>
          <label className="brutal-label">{f.label}</label>
          <input
            type="text"
            value={details[f.name] || ''}
            onChange={(e) => onUpdateDetail(f.name, e.target.value)}
            className="brutal-input"
          />
        </div>
      ))}
    </div>
  );
}

function OtherFields({ formData, onUpdateDetail }: { formData: WizardFormData; onUpdateDetail: (k: string, v: string) => void }) {
  const details = formData.details as any;
  return (
    <div className="space-y-4">
      <div>
        <label className="brutal-label">Category</label>
        <input type="text" value={details.category || ''} onChange={(e) => onUpdateDetail('category', e.target.value)} className="brutal-input" />
      </div>
      <div>
        <label className="brutal-label">Additional Info</label>
        <textarea value={details.additionalInfo || ''} onChange={(e) => onUpdateDetail('additionalInfo', e.target.value)} rows={3} className="brutal-input resize-none" />
      </div>
    </div>
  );
}

export function Step3IncidentDetails({ formData, onUpdate, onNext, onBack }: Step3Props) {
  const onUpdateDetail = (key: string, value: string) => {
    onUpdate({ details: { ...formData.details, [key]: value } as any });
  };

  const isAiFilled = (field: string) => formData.aiFilledFields.has(field);
  const detailFields = DETAIL_FIELDS[formData.claimType];

  return (
    <div className="space-y-6 brutal-animate-in">
      <h3 className="brutal-heading text-xl flex items-center gap-3">
        <span className="w-8 h-8 bg-brutal-blue text-white border-2 border-brutal-black flex items-center justify-center text-sm">3</span>
        INCIDENT DETAILS
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="brutal-label brutal-label--inline">
            Incident Date
            {isAiFilled('incidentDate') && <AiBadge confidence="medium" />}
          </label>
          <input
            type="datetime-local"
            value={formData.incidentDate ? formData.incidentDate.slice(0, 16) : ''}
            onChange={(e) => onUpdate({ incidentDate: e.target.value ? new Date(e.target.value).toISOString() : '' })}
            className={`brutal-input ${isAiFilled('incidentDate') ? 'brutal-input-ai' : ''}`}
          />
        </div>
        <div>
          <label className="brutal-label brutal-label--inline">
            Amount ($)
            {isAiFilled('estimatedAmount') && <AiBadge confidence="low" />}
          </label>
          <input
            type="number"
            value={formData.estimatedAmount ?? ''}
            onChange={(e) => onUpdate({ estimatedAmount: e.target.value ? Number(e.target.value) : null })}
            className={`brutal-input ${isAiFilled('estimatedAmount') ? 'brutal-input-ai' : ''}`}
          />
        </div>
        <div>
          <label className="brutal-label">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => onUpdate({ priority: e.target.value as ClaimPriority })}
            className="brutal-input"
          >
            {Object.values(ClaimPriority).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-[3px] w-6 bg-brutal-black" />
          <h4 className="brutal-label mb-0">
            {formData.claimType} Details
          </h4>
          <div className="h-[3px] flex-1 bg-brutal-black/10" />
        </div>
        {detailFields
          ? <FieldGrid formData={formData} onUpdateDetail={onUpdateDetail} fields={detailFields} />
          : <OtherFields formData={formData} onUpdateDetail={onUpdateDetail} />
        }
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="brutal-btn brutal-btn-secondary">
          &larr; Back
        </button>
        <button type="button" onClick={onNext} className="brutal-btn brutal-btn-primary">
          Next &rarr;
        </button>
      </div>
    </div>
  );
}
