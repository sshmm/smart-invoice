import { useSimulateContract, useWriteContract } from 'wagmi';

export type SimulateContractErrorType = ReturnType<
  typeof useSimulateContract
>['error'];

export type WriteContractErrorType = ReturnType<
  typeof useWriteContract
>['error'];

export type ProjectDetails = {
  projectName: string;
  projectDescription: string;
  projectAgreement: string;
  startDate: number;
  endDate: number;
};
