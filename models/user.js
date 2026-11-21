import axios from 'axios';

export async function fetchSteamUsers(user_id) {
    try {
        //Deres søges direkte i api'et
        const response = await axios.get(
            `https://api.deadlock-api.com/v1/players/steam?account_ids=${encodeURIComponent(user_id)}`,
            { timeout: 500 }
        );
        //Api'et retunere et array og steamId er på første 0 plads.
        const data = response.data[0]

        if (!data) return null ;
        return {
            account_id: user_id,
            personaname: data.personaname,
            avatar: data.avatar,
        };
    } catch (err) {
        console.log(err);
    }
}
