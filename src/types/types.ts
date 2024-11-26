export interface TerrariumDTO {
    id: number;
    name: string;
    temperature_goal: number;
    humidity_goal: number;
    max_temp: number;
    min_temp: number;
    max_hum: number;
    min_hum: number;
}

export interface ReadingDTO{
    id: number;
    date: string;
    temperature: number;
    humidity: number;
    terrarium_id: number;
}

export interface TerrariumData{
    id: number;
    name: string;
}

export interface UserDTO{
    id: number;
    username: string;
    password_hash: string;
    terrariumData: TerrariumData[];
}

export interface TerrariumWithReading{
    terrarium: TerrariumDTO;
    reading: ReadingDTO | null;
}
