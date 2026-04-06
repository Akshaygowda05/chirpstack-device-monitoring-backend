type ProcessResult =
  | { type: 'IGNORE' }
  | { type: 'FIRST_ENTRY' }
  | { type: 'RESET' }
  | { type: 'ANOMALY'; reason: string }
  | { type: 'VALID' };

class ValidateOdometerValue {
  private static maxDelta = 10000;

  static processOdometerValue(
    previousOdometer: number | null | undefined,
    currentOdometer: number
  ): ProcessResult {

    if (previousOdometer === null || previousOdometer === undefined) {
      return { type: 'FIRST_ENTRY' };
    }

    if (currentOdometer < previousOdometer) {
      return { type: 'RESET' };
    }

    if (currentOdometer - previousOdometer > this.maxDelta) {
      return {
        type: 'ANOMALY',
        reason: 'Odometer value increased by more than 10,000 units',
      };
    }

    if (currentOdometer > previousOdometer) {
      return { type: 'VALID' };
    }

    return { type: 'IGNORE' };
  }
}

export default ValidateOdometerValue;