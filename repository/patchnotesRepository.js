import axios from "axios";

export async function fetchPatchnotes(){
    try {
        //Det der søges i API'et
        const response = await axios.get('https://api.deadlock-api.com/v2/patches', {timeout: 5000});

        //Data der returneres fra API'et
        const data = response.data;

        const patchnotes = data.map(patchnote => ({
            title: patchnote.title,
            pub_date: patchnote.pub_date,
            link: patchnote.link,
            content: patchnote.content
        }));
        return patchnotes;

    } catch (err){
        const error = new Error('Kunne ikke hente patchnotes');
        error.status = err.response?.status === 404 ? 404 : 503; //WIP
        throw error;
    }
}