import { IERC20_ABI, PAYMENT_TYPES, TOASTS } from '@smartinvoicexyz/constants';
import { waitForSubgraphSync } from '@smartinvoicexyz/graphql';
import { InvoiceDetails, UseToastReturn } from '@smartinvoicexyz/types';
import { errorToastHandler } from '@smartinvoicexyz/utils';
import { SimulateContractErrorType, WriteContractErrorType } from '@wagmi/core';
import _ from 'lodash';
import { useCallback } from 'react';
import { Hex } from 'viem';
import {
  useChainId,
  usePublicClient,
  useSendTransaction,
  useSimulateContract,
  useWriteContract,
} from 'wagmi';

export const useDeposit = ({
  invoice,
  amount,
  hasAmount,
  paymentType,
  onTxSuccess,
  toast,
}: {
  invoice: InvoiceDetails;
  amount: bigint;
  hasAmount: boolean;
  paymentType: string;
  onTxSuccess?: () => void;
  toast: UseToastReturn;
}): {
  writeAsync: () => Promise<Hex | undefined>;
  handleDeposit: () => Promise<Hex | undefined>;
  isReady: boolean;
  isLoading: boolean;
  prepareError: SimulateContractErrorType | null;
  writeError: WriteContractErrorType | null;
} => {
  const chainId = useChainId();

  const { tokenMetadata, address } = _.pick(invoice, [
    'tokenMetadata',
    'address',
  ]);

  const publicClient = usePublicClient();

  const {
    data,
    isLoading: prepareLoading,
    error: prepareError,
  } = useSimulateContract({
    chainId,
    address: tokenMetadata?.address as Hex,
    abi: IERC20_ABI,
    functionName: 'transfer',
    args: [address as Hex, amount],
    query: {
      enabled: hasAmount && paymentType === PAYMENT_TYPES.TOKEN,
    },
  });

  const {
    writeContractAsync,
    isPending: writeLoading,
    error: writeError,
  } = useWriteContract({
    mutation: {
      onSuccess: async hash => {
        toast.info(TOASTS.useDeposit.waitingForTx);
        const receipt = await publicClient?.waitForTransactionReceipt({ hash });

        toast.info(TOASTS.useDeposit.waitingForIndex);
        if (receipt && publicClient) {
          await waitForSubgraphSync(publicClient.chain.id, receipt.blockNumber);
        }

        onTxSuccess?.();
      },
    },
  });

  const { isPending: sendLoading, sendTransactionAsync } = useSendTransaction({
    mutation: {
      onSuccess: async hash => {
        toast.info(TOASTS.useDeposit.waitingForTx);
        const receipt = await publicClient?.waitForTransactionReceipt({ hash });

        toast.info(TOASTS.useDeposit.waitingForIndex);
        if (receipt && publicClient) {
          await waitForSubgraphSync(publicClient.chain.id, receipt.blockNumber);
        }

        onTxSuccess?.();
      },
    },
  });

  const handleDeposit = async (): Promise<Hex | undefined> => {
    try {
      if (paymentType === PAYMENT_TYPES.NATIVE) {
        const result = await sendTransactionAsync({
          to: address as Hex,
          value: amount,
        });
        return result;
      }

      if (!data) {
        throw new Error('useDeposit: data is undefined');
      }

      const result = await writeContractAsync(data.request);
      return result;
    } catch (error: unknown) {
      errorToastHandler('useDeposit', error as Error, toast);
      return undefined;
    }
  };

  const writeAsync = useCallback(async (): Promise<Hex | undefined> => {
    try {
      if (!data) {
        throw new Error('simulation data is not available');
      }
      return writeContractAsync(data.request);
    } catch (error) {
      errorToastHandler('useDeposit', error as Error, toast);
      return undefined;
    }
  }, [writeContractAsync, data]);

  return {
    writeAsync,
    handleDeposit,
    isReady: true, // paymentType === PAYMENT_TYPES.NATIVE ? true : !!writeAsync,
    isLoading: prepareLoading || writeLoading || sendLoading,
    writeError,
    prepareError,
  };
};
