import theme from "@/styles/theme";

export const getStepColor = (currentStep: number, step: number): string => {
  if (currentStep > step) return theme.palette.primary.main;
  if (currentStep === step) return theme.palette.secondary.main;
  return theme.palette.grey[200];
};