import axios from 'axios';

export async function getUserById(user_id) {
    try {
        //Der søges direkte i api'et
        const response = await axios.get(
            `https://api.deadlock-api.com/v1/players/steam?account_ids=${encodeURIComponent(user_id)}`,
            { timeout: 5000 }
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

export async function getHeroStatsByUserId(user_id) {
    try {

        const reponse = await axios.get(
            `https://api.deadlock-api.com/v1/players/${encodeURIComponent(user_id)}/hero-stats`,
            { timeout: 5000 }
        );

        const data = reponse.data
        if (!data || data.length === 0) return null;
        return data.map(data => ({
            account_id: data.account_id,
            hero_id: data.hero_id,
            matches_played: data.matches_played,
            wins: data.wins,
            kills: data.kills,
            deaths: data.deaths,
            assists: data.assists,
            time_played: data.time_played,
            last_played: data.last_played,
            damage_per_min: data.damage_per_min,
            networth_per_min: data.networth_per_min,
            accuracy: data.accuracy
        }));

    } catch (err) {
        console.log(err);
    }
}

export async function getUserByName(personaname){
    try {
        const response = await axios.get(
            `https://api.deadlock-api.com/v1/players/steam-search?search_query=${encodeURIComponent(personaname)}`,
            {timeout: 5000}
        )
        const data = response.data[0]

        if (!data) return null ;
        return {
            account_id: data.account_id,
            personaname: data.personaname,
            avatar: data.avatar,
        };
    } catch (err){
        console.log(err);
    }
}

export async function getMatchHistoryByUserId(user_id){
    try {
        const response = await axios.get(
            `https://api.deadlock-api.com/v1/players/${encodeURIComponent(user_id)}/match-history`,
            {timeout: 5000}
        )
        const data = response.data
        if (!data || data.length === 0) return null;

        return data.map(data => ({
            account_id: data.account_id,
            match_id: data.match_id,
            hero_id: data.hero_id,
            hero_level: data.hero_level,
            game_mode: data.game_mode,
            Match_mode: data.Match_mode,
            Player_team: data.Player_team,
            player_kills: data.player_kills,
            player_deaths: data.deaths,
            player_assists: data.player_assists,
            denies: data.denies,
            net_worth: data.net_worth,
            last_hits: data.last_hits,
            match_duration: data.match_duration,
            match_result: data.match_result,
            objectives_mask_team0:data.objectives_mask_team0,
            objectives_mask_team1:data.objectives_mask_team1,
            Player_match_outcome: data.Player_match_outcome,
        }));
    } catch (err) {
        console.log(err);
    }
}