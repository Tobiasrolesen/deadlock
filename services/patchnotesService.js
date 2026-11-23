import * as patchnotesRepository from '../repository/patchnotesRepository.js';

export async function getPatchnotes(){
    const patchnotes = await patchnotesRepository.fetchPatchnotes();

    return sortPatchnotes(patchnotes);
}

//Eksporteres for at blive testet
//Metode til at sortere patchnotes efter dato
export function sortPatchnotes(patchnotes){
    return patchnotes.sort(
        (a, b) => new Date(b.pub_date) - new Date(a.pub_date)
    );
}

