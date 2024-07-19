export const checkIsNan = (value: any) => {
    if(value === 'NaN' || isNaN(value)) {
        return true;
    }

    return false;
}
