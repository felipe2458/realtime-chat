import path from "path";
import { promises as fs } from 'fs';

export default class JsonReaderService {
    private filePath: string;

    constructor(filePath: string){
        this.filePath = path.join(process.cwd(), filePath);
    }

    async readJson<T>(): Promise<T>{
        try{
            const data = await fs.readFile(this.filePath, 'utf-8');

            if(!data.trim()){
                return [] as T;
            }

            return JSON.parse(data) as T;
        }catch(err){
            console.error('Erro ao ler ou parsear JSON:', err);
            return [] as T;
        }
    }
}
