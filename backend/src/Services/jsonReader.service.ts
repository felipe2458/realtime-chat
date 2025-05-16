import path from "path";
import { promises as fs } from 'fs'

export default class JsonReaderService{
    private filePath: string;

    constructor(filePath: string){
        this.filePath = path.join(process.cwd(), filePath);
    }

    async readJson<T>(): Promise<T>{
        const data = await fs.readFile(this.filePath, 'utf-8');
        return JSON.parse(data) as T;   
    }
}