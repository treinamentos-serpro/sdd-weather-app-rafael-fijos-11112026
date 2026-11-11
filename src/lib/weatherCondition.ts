import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  HelpCircle,
  Sun,
} from 'lucide-react';

export function getWeatherCondition(code: number | null) {
  if (code === 0) return { label: 'Céu limpo', Icon: Sun };
  if (code === 1 || code === 2) return { label: 'Parcialmente nublado', Icon: CloudSun };
  if (code === 3) return { label: 'Nublado', Icon: Cloud };
  if (code === 45 || code === 48) return { label: 'Nevoeiro', Icon: CloudFog };
  if (code !== null && [51, 53, 55, 56, 57].includes(code))
    return { label: 'Garoa', Icon: CloudDrizzle };
  if (code !== null && [61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return { label: 'Chuva', Icon: CloudRain };
  if (code !== null && [71, 73, 75, 77, 85, 86].includes(code))
    return { label: 'Neve', Icon: CloudSnow };
  if (code !== null && [95, 96, 99].includes(code))
    return { label: 'Trovoadas', Icon: CloudLightning };
  return { label: 'Condição indisponível', Icon: HelpCircle };
}
