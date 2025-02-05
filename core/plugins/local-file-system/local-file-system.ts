import { VirtualFile, VirtualFileSystem } from '~/core/vfs'
import { LocalFile } from './local-file.ts'
import { isFileExists } from '~/core/stdlib/utils/is-file-exists.ts'
import { listFiles } from '~/core/stdlib/utils/list-files.ts'

export class LocalFileSystem extends VirtualFileSystem {
  public readonly name: string
  private readonly rootDir: string

  public constructor(name: string, rootDir: string) {
    super()
    this.name = name
    this.rootDir = rootDir
  }

  public override isFileExists(pathname: string): Promise<boolean> {
    return isFileExists(`${this.rootDir}/${pathname}`)
  }

  public override async findFileOrNull(pathname: string): Promise<VirtualFile | null> {
    if (!(await this.isFileExists(pathname))) return null
    return new LocalFile(pathname, this)
  }

  // TODO: Add caching
  public override async listFiles(): Promise<VirtualFile[]> {
    const files: VirtualFile[] = []
    for await (const pathname of listFiles(this.rootDir)) {
      files.push(new LocalFile(pathname, this))
    }
    return files
  }

  public override readTextFile(pathname: string | VirtualFile): Promise<string> {
    if (pathname instanceof VirtualFile) pathname = pathname.pathname
    return Deno.readTextFile(`${this.rootDir}/${pathname}`)
  }

  public override refresh(): Promise<void> {
    // no-op for now
    // TODO: Add caching
    return Promise.resolve()
  }
}
