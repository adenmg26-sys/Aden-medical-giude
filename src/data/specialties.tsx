import React from "react";
import { 
  ScalpelIcon,
  JointIcon,
  BrainIcon,
  FacePlasticIcon,
  BabyFaceIcon,
  UrologyIcon,
  LungsIcon,
  VascularIcon,
  ENTIcon,
  EyeIcon,
  StethoscopeIcon,
  HeartPulseIcon,
  StomachIcon,
  NephrologyIcon,
  RibbonIcon,
  PancreasIcon,
  DermatologyIcon,
  PregnancyIcon,
  PsychiatryIcon,
  RadiologyIcon,
  ToothIcon,
  PhysicalTherapyIcon
} from "@/components/icons/MedicalIcons";

export const specialtyGroups = [
  {
    title: "أولاً: التخصصات الجراحية",
    type: "surgical",
    specialties: [
      { id: "general-surgery", name: "الجراحة العامة", icon: <ScalpelIcon className="text-primary-red w-8 h-8 drop-shadow-sm" /> },
      { id: "orthopedics", name: "جراحة العظام", icon: <JointIcon className="text-primary-blue w-8 h-8 drop-shadow-sm" /> },
      { id: "neurosurgery", name: "جراحة المخ والأعصاب", icon: <BrainIcon className="text-primary-red w-8 h-8 drop-shadow-sm" /> },
      { id: "plastic-surgery", name: "جراحة التجميل", icon: <FacePlasticIcon className="text-primary-blue w-8 h-8 drop-shadow-sm" /> },
      { id: "pediatric-surgery", name: "جراحة الأطفال", icon: <BabyFaceIcon className="text-primary-red w-8 h-8 drop-shadow-sm" /> },
      { id: "urology", name: "جراحة المسالك البولية", icon: <UrologyIcon className="text-primary-blue w-8 h-8 drop-shadow-sm" /> },
      { id: "thoracic-surgery", name: "جراحة الصدر", icon: <LungsIcon className="text-primary-red w-8 h-8 drop-shadow-sm" /> },
      { id: "vascular-surgery", name: "جراحة الأوعية الدموية", icon: <VascularIcon className="text-primary-blue w-8 h-8 drop-shadow-sm" /> },
      { id: "ent", name: "جراحة الأنف والأذن والحنجرة", icon: <ENTIcon className="text-primary-red w-8 h-8 drop-shadow-sm" /> },
      { id: "ophthalmology", name: "طب وجراحة العيون", icon: <EyeIcon className="text-primary-blue w-8 h-8 drop-shadow-sm" /> },
    ]
  },
  {
    title: "ثانياً: التخصصات الباطنية",
    type: "internal",
    specialties: [
      { id: "internal-medicine", name: "الباطنة العامة", icon: <StethoscopeIcon className="text-primary-red w-8 h-8 drop-shadow-sm" /> },
      { id: "cardiology", name: "أمراض القلب", icon: <HeartPulseIcon className="text-primary-blue w-8 h-8 drop-shadow-sm" /> },
      { id: "gastroenterology", name: "أمراض الجهاز الهضمي", icon: <StomachIcon className="text-primary-red w-8 h-8 drop-shadow-sm" /> },
      { id: "nephrology", name: "أمراض الكلى", icon: <NephrologyIcon className="text-primary-blue w-8 h-8 drop-shadow-sm" /> },
      { id: "respiratory", name: "أمراض الصدر والجهاز التنفسي", icon: <LungsIcon className="text-primary-red w-8 h-8 drop-shadow-sm" /> },
      { id: "hematology", name: "أمراض الدم والأورام", icon: <RibbonIcon className="text-primary-blue w-8 h-8 drop-shadow-sm" /> },
      { id: "endocrinology", name: "الغدد الصماء والسكري", icon: <PancreasIcon className="text-primary-red w-8 h-8 drop-shadow-sm" /> },
      { id: "rheumatology", name: "الروماتيزم والمفاصل", icon: <JointIcon className="text-primary-blue w-8 h-8 drop-shadow-sm" /> },
      { id: "neurology", name: "الأعصاب", icon: <BrainIcon className="text-primary-red w-8 h-8 drop-shadow-sm" /> },
      { id: "dermatology", name: "الجلدية", icon: <DermatologyIcon className="text-primary-blue w-8 h-8 drop-shadow-sm" /> },
    ]
  },
  {
    title: "ثالثاً: تخصصات أخرى مهمة",
    type: "others",
    specialties: [
      { id: "pediatrics", name: "طب الأطفال", icon: <BabyFaceIcon className="text-primary-red w-8 h-8 drop-shadow-sm" /> },
      { id: "obgyn", name: "النساء والتوليد", icon: <PregnancyIcon className="text-primary-blue w-8 h-8 drop-shadow-sm" /> },
      { id: "psychiatry", name: "الطب النفسي", icon: <PsychiatryIcon className="text-primary-red w-8 h-8 drop-shadow-sm" /> },
      { id: "radiology", name: "الأشعة التشخيصية", icon: <RadiologyIcon className="text-primary-blue w-8 h-8 drop-shadow-sm" /> },
      { id: "dentistry", name: "طب الأسنان", icon: <ToothIcon className="text-primary-red w-8 h-8 drop-shadow-sm" /> },
      { id: "physical-therapy", name: "العلاج الطبيعي وإعادة التأهيل", icon: <PhysicalTherapyIcon className="text-primary-blue w-8 h-8 drop-shadow-sm" /> },
    ]
  }
];

export const getSpecialtyById = (id: string) => {
  for (const group of specialtyGroups) {
    const found = group.specialties.find(spec => spec.id === id);
    if (found) return found;
  }
  return null;
};

export const quickSpecialtiesList = [
  "general-surgery",
  "cardiology",
  "pediatrics",
  "dentistry",
  "ophthalmology",
  "dermatology"
].map(id => getSpecialtyById(id)).filter(Boolean);
