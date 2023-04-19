import fs from 'fs';
import { FolderStructure } from './folderStructure';


async function main() {
    const folderStructure = await FolderStructure.getFolderStructure(".", { all_lowercase: true, exclude: ["Thumbs.db", "multiplied_files.json"], exclude_case_sensitive: false });

    const res = folderStructure.findDoubleFilesByHash();
    
    fs.writeFile("multiplied_files.json", JSON.stringify(res, null, 2), { encoding: "utf-8" }, (err) => { if (err) console.error(err) });
}

main().catch(console.error);
