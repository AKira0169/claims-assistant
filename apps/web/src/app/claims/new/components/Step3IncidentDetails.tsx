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

function AutoFields({ formData, onUpdateDetail }: { formData: WizardFormData; onUpdateDetail: (k: string, v: string) => void }) {
  const details = formData.details as any;
  const fields = [
    { name: 'vehicleMake', label: 'Vehicle Make' },
    { name: 'vehicleModel', label: 'Vehicle Model' },
    { name: 'vehicleYear', label: 'Vehicle Year' },
    { name: 'licensePlate', label: 'License Plate' },
    { name: 'otherPartyName', label: 'Other Party Name' },
    { name: 'otherPartyInsurance', label: 'Other Party Insurance' },
    { name: 'policeReportNumber', label: 'Police Report Number' },
    { name: 'accidentLocation', label: 'Accident Location' },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map((f) => (
        <div key={f.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
          <input
            type="text"
            value={details[f.name] || ''}
            onChange={(e) => onUpdateDetail(f.name, e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      ))}
    </div>
  );
}

function PropertyFields({ formData, onUpdateDetail }: { formData: WizardFormData; onUpdateDetail: (k: string, v: string) => void }) {
  const details = formData.details as any;
  const fields = [
    { name: 'propertyAddress', label: 'Property Address' },
    { name: 'damageType', label: 'Damage Type' },
    { name: 'roomsAffected', label: 'Rooms Affected' },
    { name: 'propertyType', label: 'Property Type' },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map((f) => (
        <div key={f.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
          <input
            type="text"
            value={details[f.name] || ''}
            onChange={(e) => onUpdateDetail(f.name, e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      ))}
    </div>
  );
}

function HealthFields({ formData, onUpdateDetail }: { formData: WizardFormData; onUpdateDetail: (k: string, v: string) => void }) {
  const details = formData.details as any;
  const fields = [
    { name: 'providerName', label: 'Provider Name' },
    { name: 'diagnosis', label: 'Diagnosis' },
    { name: 'treatmentDate', label: 'Treatment Date' },
    { name: 'treatmentType', label: 'Treatment Type' },
    { name: 'facilityName', label: 'Facility Name' },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map((f) => (
        <div key={f.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
          <input
            type="text"
            value={details[f.name] || ''}
            onChange={(e) => onUpdateDetail(f.name, e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <input
          type="text"
          value={details.category || ''}
          onChange={(e) => onUpdateDetail('category', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Info</label>
        <textarea
          value={details.additionalInfo || ''}
          onChange={(e) => onUpdateDetail('additionalInfo', e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

export function Step3IncidentDetails({ formData, onUpdate, onNext, onBack }: Step3Props) {
  const onUpdateDetail = (key: string, value: string) => {
    onUpdate({ details: { ...formData.details, [key]: value } as any });
  };

  const isAiFilled = (field: string) => formData.aiFilledFields.has(field);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Step 3: Incident Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            Incident Date
            {isAiFilled('incidentDate') && <AiBadge confidence="medium" />}
          </label>
          <input
            type="datetime-local"
            value={formData.incidentDate ? formData.incidentDate.slice(0, 16) : ''}
            onChange={(e) => onUpdate({ incidentDate: e.target.value ? new Date(e.target.value).toISOString() : '' })}
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 ${
              isAiFilled('incidentDate') ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
            }`}
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            Estimated Amount ($)
            {isAiFilled('estimatedAmount') && <AiBadge confidence="low" />}
          </label>
          <input
            type="number"
            value={formData.estimatedAmount ?? ''}
            onChange={(e) => onUpdate({ estimatedAmount: e.target.value ? Number(e.target.value) : null })}
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 ${
              isAiFilled('estimatedAmount') ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
            }`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => onUpdate({ priority: e.target.value as ClaimPriority })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
          >
            {Object.values(ClaimPriority).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          {formData.claimType} Details
        </h4>
        {formData.claimType === ClaimType.AUTO && <AutoFields formData={formData} onUpdateDetail={onUpdateDetail} />}
        {formData.claimType === ClaimType.PROPERTY && <PropertyFields formData={formData} onUpdateDetail={onUpdateDetail} />}
        {formData.claimType === ClaimType.HEALTH && <HealthFields formData={formData} onUpdateDetail={onUpdateDetail} />}
        {formData.claimType === ClaimType.OTHER && <OtherFields formData={formData} onUpdateDetail={onUpdateDetail} />}
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          Back
        </button>
        <button type="button" onClick={onNext} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Next
        </button>
      </div>
    </div>
  );
}
