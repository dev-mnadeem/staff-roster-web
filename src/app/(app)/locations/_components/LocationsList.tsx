import { type FunctionComponent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Location } from "@/types/location";

export type LocationsListProps = {
  locations: Location[];
};

export const LocationsList: FunctionComponent<LocationsListProps> = ({
  locations,
}) => {
  if (locations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No locations yet</CardTitle>
          <CardDescription>
            An admin can add the first location to get started.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {locations.map((location) => (
        <Card key={location.id}>
          <CardHeader>
            <CardTitle>{location.name}</CardTitle>
            <CardDescription>{location.timezone}</CardDescription>
          </CardHeader>
          {location.address ? (
            <CardContent className="text-muted-foreground text-sm">
              {location.address}
            </CardContent>
          ) : null}
        </Card>
      ))}
    </div>
  );
};
