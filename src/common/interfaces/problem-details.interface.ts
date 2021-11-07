export interface ProblemDetails {
  status: number;
  title: string;
  type: string;
  detail?: string;
  instance?: string;
  [key: string]: unknown;
}
