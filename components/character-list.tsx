import Image from 'next/image'
import { Character } from '@/lib/api'

export const CharacterList = ({ characters }: { characters: Character[] }) => {
    if (!characters || characters.length === 0) return null

    return (
        <section className="px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground mb-4 border-l-4 border-primary pl-3 flex items-center gap-2">
                Characters <span className="text-sm font-normal text-muted-foreground">({characters.length})</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {characters.map((char) => {
                    const va = char.voice_actors.find((v) => v.language === 'Japanese') || char.voice_actors[0]
                    return (
                        <div key={char.character.mal_id} className="group relative bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all focus:outline-none z-10">
                            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-lg"> 
                                <Image 
                                    src={char.character.images.jpg.image_url} 
                                    alt={char.character.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-lg gpu-accelerate"
                                    sizes="(max-width: 768px) 50vw, 15vw"
                                />
                                <div className="absolute top-2 right-2">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full shadow-sm ${
                                        char.role === 'Main' ? 'bg-primary text-primary-foreground' : 'bg-black/60 text-white backdrop-blur-sm'
                                    }`}>
                                        {char.role}
                                    </span>
                                </div>
                            </div>
                            <div className="p-3">
                                <p className="font-bold text-sm text-foreground line-clamp-1" title={char.character.name}>
                                    {char.character.name}
                                </p>
                                {va && (
                                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                                        <span className="truncate max-w-[80%]" title={va.person.name}>{va.person.name}</span>
                                        <span className="text-[9px] px-1 rounded opacity-70 dark:text-foreground/80">JP</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}