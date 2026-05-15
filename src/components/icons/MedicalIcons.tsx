import React from "react";
// We use dynamic imports or just direct imports from healthicons-react
// The standard way is import { GeneralSurgery } from 'healthicons-react/dist/filled/GeneralSurgery' or similar.
// Since healthicons 3+ might not have TypeScript declarations for every internal file, we can import from the main package if it exports them, or from the specific filled path.
// Let's use any for now or let TS infer if we use require.

const HealthIcons = require('healthicons-react');

// Fallback to basic icons if something fails
const SafeIcon = ({ Component, className }: { Component: any, className?: string }) => {
  if (!Component) return <div className={className} style={{background: 'red', borderRadius: '50%'}}></div>;
  return <Component className={className} />;
};

export const ScalpelIcon = ({ className }: { className?: string }) => <SafeIcon Component={HealthIcons.GeneralSurgery || HealthIcons.GeneralSurgeryOutline} className={className} />;
export const JointIcon = ({ className }: { className?: string }) => <SafeIcon Component={HealthIcons.Orthopaedics || HealthIcons.OrthopaedicsOutline} className={className} />;
export const BrainIcon = ({ className }: { className?: string }) => <SafeIcon Component={HealthIcons.Neurology || HealthIcons.NeurologyOutline} className={className} />;
export const FacePlasticIcon = ({ className }: { className?: string }) => <SafeIcon Component={HealthIcons.Head || HealthIcons.HeadOutline} className={className} />;
export const BabyFaceIcon = ({ className }: { className?: string }) => <SafeIcon Component={HealthIcons.PediatricSurgery || HealthIcons.Pediatrics || HealthIcons.PediatricSurgeryOutline} className={className} />;
export const UrologyIcon = ({ className }: { className?: string }) => <SafeIcon Component={HealthIcons.Urology || HealthIcons.UrologyOutline} className={className} />;
export const LungsIcon = ({ className }: { className?: string }) => <SafeIcon Component={HealthIcons.Lungs || HealthIcons.LungsOutline} className={className} />;
export const VascularIcon = ({ className }: { className?: string }) => <SafeIcon Component={HealthIcons.VascularSurgery || HealthIcons.VascularSurgeryOutline} className={className} />;
export const ENTIcon = ({ className }: { className?: string }) => <SafeIcon Component={HealthIcons.EarNoseThroat || HealthIcons.EarNoseThroatOutline} className={className} />;
export const EyeIcon = ({ className }: { className?: string }) => <SafeIcon Component={HealthIcons.Opthalmology || HealthIcons.OpthalmologyOutline} className={className} />;
export const StethoscopeIcon = ({ className }: { className?: string }) => <SafeIcon Component={HealthIcons.Stethoscope || HealthIcons.StethoscopeOutline} className={className} />;
export const HeartPulseIcon = ({ className }: { className?: string }) => <SafeIcon Component={HealthIcons.Cardiology || HealthIcons.CardiologyOutline} className={className} />;
export const StomachIcon = ({ className }: { className?: string }) => <SafeIcon Component={HealthIcons.Gastroenterology || HealthIcons.GastroenterologyOutline} className={className} />;
export const NephrologyIcon = ({ className }: { className?: string }) => <SafeIcon Component={HealthIcons.Nephrology || HealthIcons.NephrologyOutline} className={className} />;
export const RibbonIcon = ({ className }: { className?: string }) => <SafeIcon Component={HealthIcons.Oncology || HealthIcons.Hematology || HealthIcons.OncologyOutline} className={className} />;
export const PancreasIcon = ({ className }: { className?: string }) => <SafeIcon Component={HealthIcons.Endocrinology || HealthIcons.Pancreas || HealthIcons.EndocrinologyOutline} className={className} />;
export const DermatologyIcon = ({ className }: { className?: string }) => <SafeIcon Component={HealthIcons.SkinCancer || HealthIcons.Dermatology || HealthIcons.SkinCancerOutline} className={className} />;
export const PregnancyIcon = ({ className }: { className?: string }) => <SafeIcon Component={HealthIcons.Pregnant || HealthIcons.PregnantOutline} className={className} />;
export const PsychiatryIcon = ({ className }: { className?: string }) => <SafeIcon Component={HealthIcons.Psychology || HealthIcons.PsychologyOutline} className={className} />;
export const RadiologyIcon = ({ className }: { className?: string }) => <SafeIcon Component={HealthIcons.Radiology || HealthIcons.RadiologyOutline} className={className} />;
export const ToothIcon = ({ className }: { className?: string }) => <SafeIcon Component={HealthIcons.Odontology || HealthIcons.OdontologyOutline} className={className} />;
export const PhysicalTherapyIcon = ({ className }: { className?: string }) => <SafeIcon Component={HealthIcons.PhysicalTherapy || HealthIcons.PhysicalTherapyOutline || HealthIcons.WalkSupported} className={className} />;

