const starttime = new Date().getTime();
const { writeFileSync, readFileSync } = require('fs');
const Pokemon = require('pokemon.js');
Pokemon.setLanguage('english');
if (process.argv[2] === '--help' || process.argv[2] === '-h' || process.argv.length === 1)
	console.log(`--TOP X POKÉMON BY TYPE GETTER--\n\nUSAGE:\ntopx [--help|-h] : Show help.
topx [--update|-u] : Update/create pokemonlist.json file.
topx <stat> <type> <order> <num> [--online|-o] [--save|-s] : Get pokemon list by parameters.\n\nPARAMETERS:
stat: hp|at|de|sa|sd|sp
type: Any of the 18 types in english|all (all takes all Pokémon into account)
order: top|bot
num: Number of entries to get.
--online (optional): Get the stats from the api, not the file.
--save (optional, requires --online): Saves the stats (same as update).\n\nEnjoy!`);
else
	(async () => {
		let pokelist = [];
		if (
			process.argv[2] === '--update' ||
			process.argv[2] === '-u' ||
			(process.argv[6] !== undefined && (process.argv[6] === '--online' || process.argv[6] === '-o'))
		) {
			pokelist = await Pokemon.getAll('pokemon').then(async data => {
				const list = [];
				console.log('Loading...');
				data = data
					.filter(x => !x.includes('gmax'))
					.filter(x => !x.includes('eternamax'))
					.filter(x => !x.includes('totem'))
					.filter(x => !x.includes('battle-bond'))
					.filter(x => !x.includes('minior-') || x.includes('minior-red'))
					.filter(x => !x.includes('mimikyu-'))
					.filter(x => !x.includes('magearna-'))
					.filter(x => !x.includes('rockruff-'))
					.filter(x => !x.includes('pikachu-'));
				const npoks = data.length;
				for (let i = 0; i < npoks; i++) {
					const poke = data[i];
					process.stdout.write('\r\x1b[K' + Math.floor(((i + 1) / npoks) * 10000) / 100 + '%');
					const stats = await Pokemon.getStats(poke);
					const tipo = await Pokemon.getType(poke);

					list.push({
						nombre: poke,
						stats,
						tipo: [tipo[0].name, tipo[1] === undefined ? '' : tipo[1].name],
					});
				}

				process.stdout.write('\n');
				return list;
			});

			if (
				process.argv[2] === '--update' ||
				process.argv[2] === '-u' ||
				process.argv[7] === '--save' ||
				process.argv[7] === '-s'
			) {
				writeFileSync('pokemonlist.json', JSON.stringify(pokelist));
				console.log('Saved!');
				if (process.argv[2] === '--update' || process.argv[2] === '-u') {
					showTime();
					process.exit();
				}
			}
		}

		if (!(process.argv[2] === '--update' || process.argv[2] === '-u')) {
			if (process.argv[6] === undefined || (process.argv[6] !== '--online' && process.argv[6] !== '-o'))
				try {
					pokelist = JSON.parse(readFileSync('pokemonlist.json', 'utf-8'));
				} catch (error) {
					console.error(error);
					process.exit();
				}

			let stat = '';
			let showstat = '';
			switch (process.argv[2]) {
				case 'hp':
					stat = 'hp';
					showstat = 'HP';
					break;
				case 'at':
					stat = 'attack';
					showstat = 'Attack';
					break;
				case 'de':
					stat = 'defense';
					showstat = 'Defense';
					break;
				case 'sa':
					stat = 'special-attack';
					showstat = 'Special Attack';
					break;
				case 'sd':
					stat = 'special-defense';
					showstat = 'Special Defense';
					break;
				case 'sp':
					stat = 'speed';
					showstat = 'Speed';
					break;
				default:
					break;
			}

			const type = process.argv[3];
			const order = process.argv[4];
			const num = process.argv[5];
			const res = pokelist
				.filter(x => (type === 'all' ? true : x.tipo[0] === type || x.tipo[1] === type))
				.sort((a, b) => {
					if (order === 'bot') return a.stats[stat] - b.stats[stat];
					return b.stats[stat] - a.stats[stat];
				})
				.filter((x, i) => i < num);

			console.log(
				`${order === 'top' ? 'Top' : 'Bottom'} ${num} ${
					type[0].toUpperCase() + type.substring(1)
				} Pokémon by ${showstat}`,
			);
			for (let i = 0; i < res.length; i++) console.log(`${i + 1}: ${res[i].nombre} - ${res[i].stats[stat]}`);
			showTime();
		}
	})();

function showTime() {
	const t2 = new Date().getTime();
	let elapsed = t2 - starttime;
	if (elapsed > 1000) {
		elapsed = Math.floor((elapsed / 1000) * 100) / 100;
		console.log(`Process completed in ${elapsed}s`);
	} else console.log(`Process completed in ${elapsed}ms`);
}
