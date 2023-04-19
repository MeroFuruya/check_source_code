import fs from 'fs';

export class FolderStructure {
    name: string;
    path: string;
    files: FolderStructure[];
    isFile: boolean;

    constructor(name: string, path: string, files: FolderStructure[],  isFile = false) {
        this.name = name;
        this.path = path;
        this.files = files;
        this.isFile = isFile;
    }

    public printFolderStructure(depth = 0) {
        console.log(`${" ".repeat(depth)}${this.name}`);
        for (const file of this.files) {
            if (file.files.length > 0) {
                file.printFolderStructure(depth + 1);
            } else {
                console.log(`${" ".repeat(depth + 1)}${file.name}`);
            }
        }
    }

    public findFile(name: string): FolderStructure[] | undefined {
        const res: FolderStructure[] = [];
        for (const file of this.files) {
            if (file.isFile && file.name === name) {
                res.push(file);
            } else if (file.files.length > 0) {
                const res2 = file.findFile(name);
                if (res2) res.push(...res2);
            }
        }
        return res;
    }

    public findDoubleFiles(): { name: string, files: FolderStructure[] }[] | undefined {
        const res: { name: string, files: FolderStructure[] }[] = [];
        for (const file of this.files) {
            if (file.isFile) {
                const res2 = this.findFile(file.name);
                if (res2 && res2.length > 1) {
                    res.push({ name: file.name, files: res2 });
                }
            } else if (file.files.length > 0) {
                const res2 = file.findDoubleFiles();
                if (res2) res.push(...res2);
            }
        }
        return res;
    }

    public findDoubleFilesByHash(): { name: string, files: FolderStructure[] }[] | undefined {
        const res: { name: string, files: FolderStructure[] }[] = [];
        for (const file of this.files) {
            if (file.isFile) {
                const res2 = this.findFile(file.name);
                if (res2 && res2.length > 1) {
                    res.push({ name: file.name, files: res2 });
                }
            } else if (file.files.length > 0) {
                const res2 = file.findDoubleFiles();
                if (res2) res.push(...res2);
            }
        }
        return res;
    }

    public static async getFolderStructure(directory = "./", options = { all_lowercase: true, exclude: ["Thumbs.db"], exclude_case_sensitive: false }): Promise<FolderStructure> {
        // append "/" to directory if not present
        if (!directory.endsWith("/")) directory += "/";
        // convert exclude list to lowercase if not case sensitive
        const exclude_list = options.exclude.map( options.exclude_case_sensitive ? (e) => e : (e) => e.toLowerCase());
        // create new FolderStructure
        const res: FolderStructure = new FolderStructure(directory, directory, []);
        // read directory
        const dir = await fs.promises.readdir(directory, { withFileTypes: true });
        // loop through files
        for (const file of dir) {
            // check if file is excluded
            const exclude_filename = options.exclude_case_sensitive ? file.name : file.name.toLowerCase()
            if (exclude_list.includes(file.isDirectory() ? `/${exclude_filename}` : exclude_filename)) continue;
            // convert file name to lowercase if all_lowercase is true
            const file_name = options.all_lowercase ? file.name.toLowerCase() : file.name
            // check if file is directory
            if (file.isDirectory()) {
                // add directory to files
                res.files.push(await FolderStructure.getFolderStructure(`${directory}${file_name}/`, options));
            } else {
                // add file to files
                res.files.push(new FolderStructure(file.name, `${directory}${file_name}`, [], true));
            }
        };
        return res;
    }
}
