export interface Quake {
  _id: string;
  year: string;
  day: string;
  hour: string;
  minute: string;
  seconds: string;
  latitude: number;
  longitude: number;
  magnitude: number;
  station: {
    value: string;
    label: string;
  }[],
  createdAt: string;
  updatedAt: string;
  __v: number;
}

