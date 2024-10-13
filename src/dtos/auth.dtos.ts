export interface RegisterDTO {
    name: string,
    age: number,
    gender: string,
    complexion: string,
    functions: {
        waalk: string,
        sleep: string,
        talk: string
    }
}