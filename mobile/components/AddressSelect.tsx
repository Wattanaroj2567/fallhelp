// components/AddressSelect.tsx
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { getProvinces, getAmphoes, getDistricts, getZipcode } from '@/utils/thailandAddress';
import { FloatingLabelInput } from './FloatingLabelInput';
import { AutocompleteInput } from './AutocompleteInput';

export interface AddressData {
  houseNumber: string;
  village: string;
  subdistrict: string;
  district: string;
  province: string;
  zipcode: string;
}

interface AddressSelectProps {
  value: AddressData;
  onChange: (address: AddressData) => void;
  errors?: {
    houseNumber?: string;
    village?: string;
    subdistrict?: string;
    district?: string;
    province?: string;
    zipcode?: string;
  };
}

export default function AddressSelect({ value, onChange, errors }: AddressSelectProps) {
  const [provinces, setProvinces] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [subdistricts, setSubdistricts] = useState<string[]>([]);

  const [provinceSearch, setProvinceSearch] = useState(value.province);
  const [districtSearch, setDistrictSearch] = useState(value.district);
  const [subdistrictSearch, setSubdistrictSearch] = useState(value.subdistrict);

  // Initialize provinces on mount
  useEffect(() => {
    const provinceNames = getProvinces();
    setProvinces(provinceNames);
  }, []);

  // When province changes, update districts
  useEffect(() => {
    if (provinceSearch) {
      const amphoeNames = getAmphoes(provinceSearch);
      setDistricts(amphoeNames);
    } else {
      setDistricts([]);
      setSubdistricts([]);
    }
  }, [provinceSearch]);

  // When district changes, update subdistricts
  useEffect(() => {
    if (districtSearch && provinceSearch) {
      const districtNames = getDistricts(provinceSearch, districtSearch);
      setSubdistricts(districtNames);
    } else {
      setSubdistricts([]);
    }
  }, [districtSearch, provinceSearch]);

  // When subdistrict changes, auto-fill zipcode
  useEffect(() => {
    if (subdistrictSearch && districtSearch && provinceSearch) {
      const zipcode = getZipcode(provinceSearch, districtSearch, subdistrictSearch);
      if (zipcode) {
        // Prevent infinite loop by checking if value actually changed
        const newZipcode = String(zipcode);
        if (value.zipcode !== newZipcode || value.subdistrict !== subdistrictSearch) {
          onChange({
            ...value,
            subdistrict: subdistrictSearch,
            zipcode: newZipcode,
          });
        }
      }
    }
  }, [subdistrictSearch, districtSearch, provinceSearch, value, onChange]);

  const handleProvinceChange = (text: string) => {
    setProvinceSearch(text);
    onChange({
      ...value,
      province: text,
      district: '',
      subdistrict: '',
      zipcode: '',
    });
    setDistrictSearch('');
    setSubdistrictSearch('');
  };

  const handleDistrictChange = (text: string) => {
    setDistrictSearch(text);
    onChange({
      ...value,
      district: text,
      subdistrict: '',
      zipcode: '',
    });
    setSubdistrictSearch('');
  };

  const handleSubdistrictChange = (text: string) => {
    setSubdistrictSearch(text);
  };

  return (
    <View className="gap-4">
      <FloatingLabelInput
        label="บ้านเลขที่"
        value={value.houseNumber}
        onChangeText={(text: string) => onChange({ ...value, houseNumber: text })}
        isRequired
        error={errors?.houseNumber}
        placeholder="เช่น 123, 45/67"
      />

      <FloatingLabelInput
        label="หมู่บ้าน/อาคาร"
        value={value.village}
        onChangeText={(text: string) => onChange({ ...value, village: text })}
        error={errors?.village}
        placeholder="เช่น หมู่บ้านสุขสันต์, อาคารเอ"
      />

      <AutocompleteInput
        label="จังหวัด"
        value={provinceSearch}
        onChangeText={handleProvinceChange}
        options={provinces}
        isRequired
        error={errors?.province}
        placeholder="เลือกหรือพิมพ์จังหวัด"
      />

      <AutocompleteInput
        label="อำเภอ/เขต"
        value={districtSearch}
        onChangeText={handleDistrictChange}
        options={districts}
        isRequired
        error={errors?.district}
        placeholder="เลือกหรือพิมพ์อำเภอ/เขต"
        editable={!!provinceSearch}
      />

      <AutocompleteInput
        label="ตำบล/แขวง"
        value={subdistrictSearch}
        onChangeText={handleSubdistrictChange}
        options={subdistricts}
        isRequired
        error={errors?.subdistrict}
        placeholder="เลือกหรือพิมพ์ตำบล/แขวง"
        editable={!!districtSearch}
      />

      <FloatingLabelInput
        label="รหัสไปรษณีย์"
        value={value.zipcode}
        onChangeText={(text: string) => onChange({ ...value, zipcode: text })}
        isRequired
        error={errors?.zipcode}
        keyboardType="numeric"
        editable={false}
        placeholder="จะแสดงอัตโนมัติ"
      />
    </View>
  );
}
