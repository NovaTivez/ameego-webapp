import { PixelBuildingCard } from "@/components/PixelBuildingCard";
import type { AcademyLocation } from "@/lib/academy";

type AcademyLocationCardProps = {
  location: AcademyLocation;
};

export function AcademyLocationCard({ location }: AcademyLocationCardProps) {
  return <PixelBuildingCard location={location} />;
}
