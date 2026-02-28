import { useQuery } from '@tanstack/react-query';
import organizationService from '../services/organizationService';

export const useProvinces = () => {
    return useQuery({
        queryKey: ['provinces'],
        queryFn: () => organizationService.getProvinces(),
    });
};

export const useBuildings = (provinceId?: string) => {
    return useQuery({
        queryKey: ['buildings', provinceId],
        queryFn: () => organizationService.getBuildings(provinceId),
        enabled: !!provinceId || provinceId === undefined, // allow fetching all if undefined
    });
};

export const useDepartments = (buildingId?: string) => {
    return useQuery({
        queryKey: ['departments', buildingId],
        queryFn: () => organizationService.getDepartments(buildingId),
        enabled: !!buildingId || buildingId === undefined,
    });
};
