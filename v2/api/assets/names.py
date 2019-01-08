#!/usr/bin/python2.7

settlements = [
    "Aitos",
    "Anor Londo",
    "Arcadia",
    "Arkovia",
    "Beacon",
    "Blackrock",
    "Blackwalk",
    "Blaviken",
    "Bleakstone",
    "Bloodbriar",
    "Bloodpool",
    "Bloodreach",
    "Bloodstone",
    "Bloodwalk",
    "Cairn",
    "Caprica",
    "Carthus",
    "Cimmeria",
    "Daggerfall",
    "Darkover",
    "Darkreach",
    "Darkvale",
    "Darill's Tomb",
    "Darunia",
    "Dawn",
    "Dawnstar",
    "Deadrock",
    "Death Heim",
    "Death Mountain",
    "Devil's Crossing",
    "Doomhaven",
    "Doomrock",
    "Dread",
    "Dreadrock",
    "Eastmarch",
    "Eastmost Penninsula",
    "Ember",
    "Emberguard",
    "Emberhold",
    "Emberwatch",
    "Fabul",
    "Fillmore",
    "Fireshrine",
    "First Light",
    "Founder's Rest",
    "Fourhorn",
    "Frigid River",
    "Gloom",
    "Gloomhaven",
    "Gormrange",
    "Graverock",
    "Gravestone",
    "Haven",
    "Hogwarts",
    "Hogsmeade",
    "Home",
    "Hope",
    "Hyrule",
    "Irondune",
    "Izalith",
    "Kaer Morhen",
    "Kasuto",
    "Kattegat",
    "Keizaal",
    "Krondor",
    "Lantern's Reach",
    "Last Light",
    "Lightfall",
    "Lufenia",
    "Lumina",
    "Lux",
    "Melmond",
    "Mido",
    "Mist",
    "Mysidia",
    "Narshe",
    "New Londo",
    "Nurmengard",
    "Nilfgaard",
    "Nox",
    "Old Arkovia",
    "Old Kasuto",
    "Onrac",
    "Proudrock",
    "Pthumeria",
    "Radiance",
    "Rivia",
    "Rockall",
    "Ruto",
    "Sanctuary",
    "San Junipero",
    "Satan's Lantern",
    "Serenity Valley",
    "Sethanon",
    "Shanbar",
    "Shadow's End",
    "Silent Hill",
    "Solitude",
    "Spectacle Rock",
    "Steppinthrax",
    "Stonemarch",
    "Stonevale",
    "The Ancient Lantern",
    "The Black Lantern",
    "The Gambler's Lantern",
    "The Gold Lantern",
    "The Silver Lantern",
    "The White Lantern",
    "Three Eye Rock",
    "Tristram",
    "Vizima",
    "Westmarch",
    "White Rock",
    "Whiterun",
    "Wightmire",
    "Witchweed",
    "Yharnam",
    "Zork",
]

male = [
    "Aaron",
    "Aberforth",
    "Achilles",
    "Adam",
    "Aeneas",
    "Aerol",
    "Aias",
    "Ajax",
    "Akira",
    "Albus",
    "Aldrich",
    "Alduin",
    "Alexander",
    "Alucard",
    "Allister",
    "Alva",
    "Alyson",
    "Amos",
    "Anchises",
    "Andrzej",
    "Anthony",
    "Anton",
    "Armitage",
    "Arnaud",
    "Artorias",
    "Arthur",
    "Arutha",
    "Asher",
    "Astyanax",
    "Atreyu",
    "Atticus",
    "Augustus",
    "Aziz",
    "Barnabas",
    "Batou",
    "Benedict",
    "Borris",
    "Brian",
    "Brooks",
    "Caleb",
    "Caliban",
    "Calvin",
    "Canuk",
    "Case",
    "Cash",
    "Cathbad",
    "Cecil",
    "Clint",
    "Cole",
    "Conan",
    "Corbin",
    "Croesus",
    "Crono",
    "Cuchulain",
    "Cyan",
    "Cyril",
    "Cyrus",
    "Damon",
    "Dante",
    "Dashiell",
    "Declan",
    "Demetrius",
    "Demarcus",
    "Del",
    "Delekhan",
    "Delita",
    "Deltron",
    "Derek",
    "Diego",
    "Diomedes",
    "Direni",
    "Donovan",
    "Draco",
    "Drizzt",
    "Duncan",
    "Edward",
    "Eirik",
    "Eldon",
    "Eli",
    "Elvis",
    "Erasmus",
    "Erdrick",
    "Errol",
    "Eskel",
    "Esteban",
    "Ezekiel",
    "Ezra",
    "Farooq",
    "Felix",
    "Fester",
    "Fidel",
    "Fingal",
    "Finn",
    "Foster",
    "Francis",
    "Frog",
    "Gabriel",
    "Gaiseric",
    "Galen",
    "Gaunther",
    "Gellert",
    "Gerald",
    "Geralt",
    "Gerard",
    "Giovanni",
    "Gomez",
    "Gorath",
    "Grant",
    "Griffith",
    "Grimnir",
    "Grognak",
    "Gustavo",
    "Guy",
    "Gwyn",
    "Gyuri",
    "Haakon",
    "Hadrian",
    "Harman",
    "Hawkeye",
    "Hector",
    "Hideki",
    "Hideo",
    "Hipolito",
    "Hiram",
    "Hobbes",
    "Hugh",
    "Humbert",
    "Humberto",
    "Ian",
    "Icarus",
    "Idris",
    "Ignacio",
    "Ike",
    "Ingward",
    "Irving",
    "Israel",
    "Isaac",
    "Jacob",
    "Jacinto",
    "Jeremy",
    "Jesse",
    "Jaoquin",
    "Jimmy",
    "Jon",
    "Jonah",
    "Jorge",
    "Jude",
    "Julius",
    "Kalameet",
    "Kane",
    "Karl",
    "Khalil",
    "Khoa",
    "Khorvash",
    "Killian",
    "Kieran",
    "Kirk",
    "Kiryu",
    "Klaus",
    "Korben",
    "Kris",
    "Kyle",
    "Lambert",
    "Lance",
    "Laurentius",
    "Lautrec",
    "Lazaro",
    "Lebiodus",
    "Leif",
    "Leonard",
    "Leto",
    "Locklear",
    "Logan",
    "Lorn",
    "Loto",
    "Liam",
    "Lincoln",
    "Link",
    "Locke",
    "Lucas",
    "Lucien",
    "Lucius",
    "Luther",
    "Lyman",
    "Lysandus",
    "Magnus",
    "Majima",
    "Malcolm",
    "Malik",
    "Malvolio",
    "Manannan",
    "Marcus",
    "Mason",
    "Maelcum",
    "Maximo",
    "Maxwell",
    "Maynard",
    "Merlin",
    "Moadikum",
    "Modesto",
    "Mohammed",
    "Moodock",
    "Morne",
    "Mordack",
    "Morty",
    "Moshe",
    "Micah",
    "Milamber",
    "Mulder",
    "Murmandamus",
    "Nathan",
    "Naveen",
    "Nero",
    "Nestor",
    "Neville",
    "Nils",
    "Norman",
    "Noah",
    "Oberon",
    "Odin",
    "Olaf",
    "Oliver",
    "Olivander",
    "Orlando",
    "Ozelianho",
    "Owen",
    "Owyn",
    "Paul",
    "Pawel",
    "Pelagius",
    "Percival",
    "Peter",
    "Petrus",
    "Piotr",
    "Preston",
    "Puck",
    "Pug",
    "Quentin",
    "Ramza",
    "Rashad",
    "Ravix",
    "Raynaldo",
    "Reuben",
    "Reed",
    "Regulus",
    "Reinhardt",
    "Reinaldo",
    "Robb",
    "Robert",
    "Rodin",
    "Ron",
    "Ronan",
    "Rico",
    "Rick",
    "Rickert",
    "Royal",
    "Roland",
    "Rolondo",
    "Rolo",
    "Royce",
    "Rubicante",
    "Ruby Rhod",
    "Ryu",
    "Sean",
    "Sergei",
    "Setzer",
    "Severus",
    "Sigi",
    "Sigmund",
    "Silas",
    "Sirius",
    "Shane",
    "Simon",
    "Santiago",
    "Solomon",
    "Sylvester",
    "Sang",
    "Seth",
    "Stammelford",
    "Stark",
    "Talos",
    "Tannhauser",
    "Telamon",
    "Tetsuo",
    "Teucer",
    "Thanh",
    "Theron",
    "Theseus",
    "Thor",
    "Timon",
    "Timothy",
    "Titus",
    "Tobias",
    "Tony",
    "Trapper",
    "Trembyle",
    "Trent",
    "Trevor",
    "Trey",
    "Ubin",
    "Ulf",
    "Ulrich",
    "Ulysses",
    "Umberto",
    "Unferth",
    "Uriel",
    "Valentine",
    "Varg",
    "Vaughn",
    "Vesemir",
    "Victor",
    "Vincenzo",
    "Virgil",
    "Vimme",
    "Vivec",
    "Vlad",
    "Voltaire",
    "Ward",
    "Wallace",
    "Wei Shen",
    "Wiglaf",
    "William",
    "Wilfred",
    "Wulfric",
    "Xarosan",
    "Xavier",
    "Xerxes",
    "Yang",
    "Zachary",
    "Zane",
    "Zeke",
    "Zhu Di",
    "Zophar",
    "Zurin",
]

female = [
    "Acacia",
    "Adda",
    "Adrasteia",
    "Agnes",
    "Amaryllis",
    "Amber",
    "Amphirite",
    "April",
    "Anna",
    "Arabella",
    "Ariana",
    "Ashlotte",
    "Alenia",
    "Alexa",
    "Alexandria",
    "Alia",
    "Amal",
    "Andromache",
    "Antiope",
    "Arethusa",
    "Aria",
    "Arlen",
    "Arya",
    "Athena",
    "Audrey",
    "Aurelia",
    "Aurora",
    "Axioche",
    "Azura",
    "Ava",
    "Avalon",
    "Ayla",
    "Barbarella",
    "Barenziah",
    "Bathilda",
    "Bayonetta",
    "Beatrice",
    "Beatrix",
    "Bellatrix",
    "Belle",
    "Belit",
    "Bianca",
    "Blossom",
    "Bodhmall",
    "Brianne",
    "Bridget",
    "Brooke",
    "Bronwyn",
    "Buffy",
    "Caitlyn",
    "Celes",
    "Camelia",
    "Camilla",
    "Carmen",
    "Casca",
    "Cassandra",
    "Cassima",
    "Catelyn",
    "Cayce",
    "Cecily",
    "Celeste",
    "Cereza",
    "Cersei",
    "Charli",
    "Charlotte",
    "Chell",
    "Cheree",
    "Chevette",
    "Ciaran",
    "Ciri",
    "Cirilla",
    "Cleo",
    "Cleodora",
    "Cleopatra",
    "Cornelia",
    "Daenerys",
    "Dahlia",
    "Daisy",
    "Dapnhe",
    "Deichtine",
    "Delilah",
    "Delphine",
    "Demeter",
    "Desdemona",
    "Diana",
    "Dua",
    "Dusk",
    "Eir",
    "Eirwen",
    "Electra",
    "Elena",
    "Elisif",
    "Eliza",
    "Ellen",
    "Elspeth",
    "Emer",
    "Emilia",
    "Erica",
    "Ezra",
    "Esmerelda",
    "Esti",
    "Eve",
    "Fade",
    "Fairuza",
    "Fern",
    "Fiona",
    "Florence",
    "Flynne",
    "Frances",
    "Freya",
    "Gabrielle",
    "Genevieve",
    "Gillian",
    "Gin",
    "Ginerva",
    "Ginny",
    "Gloria",
    "Glory",
    "Goneril",
    "Grace",
    "Gwaelin",
    "Gwen",
    "Haifa",
    "Heather",
    "Hecuba",
    "Hecate",
    "Hermione",
    "Harper",
    "Heidrun",
    "Hilary",
    "Hinata",
    "Hollis",
    "Hope",
    "Ida",
    "Igraine",
    "Iola",
    "Iman",
    "Ingrid",
    "Iphigeneia",
    "Ira",
    "Irina",
    "Iris",
    "Isabella",
    "Isolde",
    "Ivy",
    "Jakelin",
    "Jaclyn",
    "Janet",
    "Jayne",
    "Jasmine",
    "Jeanne",
    "Jennifer",
    "Jezebel",
    "Joi",
    "Jolyne",
    "Julia",
    "Juliet",
    "Kalliope",
    "Kara",
    "Katarina",
    "Katniss",
    "Kei",
    "Kendall",
    "Kendra",
    "Kestrel",
    "Kiyoko",
    "Kira",
    "Kiernan",
    "Keira",
    "Kumiko",
    "Kyra",
    "Lana",
    "Lavender",
    "Laverne",
    "Lavinia",
    "Leeloo",
    "Leia",
    "Leigh",
    "Leuce",
    "Lexi",
    "Libby",
    "Lily",
    "Lilvani",
    "Linda Lee",
    "Lisa",
    "Lola",
    "Lolita",
    "Lolotte",
    "Lorde",
    "Lucca",
    "Lucille",
    "Lucy",
    "Luna",
    "Lydia",
    "Mab",
    "Mabel",
    "Marigold",
    "Maeve",
    "Magdalena",
    "Mako",
    "Maleficent",
    "Mallory",
    "Malvina",
    "Marina",
    "Marle",
    "Mary",
    "Maria",
    "Maya",
    "Megha",
    "Melitele",
    "Mephala",
    "Michiko",
    "Minerva",
    "Miranda",
    "Misty",
    "Mitsuko",
    "Molly",
    "Moana",
    "Mona",
    "Monika",
    "Morgana",
    "Morticia",
    "Motoko",
    "Nadia",
    "Narcissa",
    "Neda",
    "Nenneke",
    "Nia",
    "Naomi",
    "Noriko",
    "Nozomi",
    "Nulfaga",
    "Nyx",
    "Odette",
    "Ophelia",
    "Olive",
    "Olivia",
    "Olwen",
    "Opal",
    "Orchid",
    "Ozma",
    "Paetra",
    "Paige",
    "Patricia",
    "Pauline",
    "Pearl",
    "Pepper",
    "Phaedra",
    "Phoebe",
    "Piper",
    "Polly Jean",
    "Potema",
    "Quelana",
    "Quinn",
    "Quirina",
    "Rachna",
    "Rachel",
    "Rada",
    "Raina",
    "Rasha",
    "Rayna",
    "Regan",
    "Regina",
    "Renee",
    "Rhea",
    "Rhianon",
    "Rhys",
    "Ria",
    "Ripley",
    "Romilda",
    "Rosa",
    "Rosalind",
    "Rosaria",
    "Rosario",
    "Rose",
    "Rosella",
    "Rowena",
    "Ruby",
    "Sabrina",
    "Sakura",
    "Samantha",
    "Sansa",
    "Sara",
    "Scarlet",
    "Scarlett",
    "Scheherazade",
    "Scully",
    "Scylla",
    "Senua",
    "Serafina",
    "Serena",
    "Setsuka",
    "Shyma",
    "Sibyl",
    "Sif",
    "Sigrun",
    "Simone",
    "Six",
    "Soledad",
    "Sonia",
    "Sonja",
    "Sophia",
    "Sophitia",
    "Skyy",
    "Stella",
    "Stormy",
    "Suki",
    "Summer",
    "Susanna",
    "Sybil",
    "Tamara",
    "Tamiko",
    "Tara",
    "Teegra",
    "Terra",
    "Thalia",
    "Themis",
    "Triss",
    "Ume",
    "Undine",
    "Unice",
    "Valencia",
    "Valeriya",
    "Vee",
    "Vena",
    "Velka",
    "Velvet",
    "Veronica",
    "Vesta",
    "Viola",
    "Violet",
    "Vivienne",
    "Vylette",
    "Wednesday",
    "Winona",
    "Wiola",
    "Wynter",
    "Xandra",
    "Xochitl",
    "Xianghua",
    "Xiu",
    "Yana",
    "Yennefer",
    "Ygritte",
    "Ylva",
    "Yoko",
    "Yrsa",
    "Yuan-Xiao",
    "Yuki",
    "Yuria",
    "Yvonne",
    "Zahara",
    "Zelda",
    "Zoe",
]

neuter = [
    "Addison",
    "Anri",
    "Ash",
    "Bishop",
    "Blackthorn",
    "Blake",
    "Blue",
    "Caelan",
    "Dana",
    "Drew",
    "Error",
    "Ghost",
    "Hayden",
    "Hunter",
    "Jones",
    "Justice",
    "Lindsey",
    "Parker",
    "Lane",
    "Mac",
    "Morgan",
    "Oakley",
    "Phoenix",
    "Quinn",
    "Raven",
    "Red",
    "Reese",
    "Revan",
    "Robin",
    "Roan",
    "Rook",
    "Sage",
    "Scout",
    "Shadow",
    "Shannon",
    "Starbuck",
    "Storm",
    "Stormy",
    "Toto",
    "Thorne",
    "Winter",
    "Wolf",
]

surname = [
    "Atreides",
    "Black",
    "Blackfist",
    "Blackheart",
    "Blackiron",
    "Bladewind",
    "Blooddawn",
    "Bloodfist",
    "Bloodgorger",
    "Bloodmoon",
    "Bloodsworn",
    "Bloodriver",
    "Bonehide",
    "Boneskin",
    "Brandwarden",
    "Butcher",
    "Butchersbane",
    "Darkheart",
    "Darkhunter",
    "Deathstrike",
    "Doomfist",
    "Doomrider",
    "Dumbledore",
    "Fargloom",
    "Gloomrock",
    "Gormbane",
    "Grey",
    "Grindelwald",
    "Gryffindor",
    "Hammerheart",
    "Harkonnen",
    "Hufflepuff",
    "Ironfist",
    "Ironside",
    "Ironthrone",
    "Kurochi",
    "Kuroishi",
    "Kurokaze",
    "Lanterner",
    "Lionsbane",
    "Lionheart",
    "Lionslayer",
    "Malfoy",
    "Mourneblade",
    "Ochoa",
    "O'Connell",
    "Poots",
    "Potter",
    "Ravenclaw",
    "Riddle",
    "Rockbone",
    "Skullhunter",
    "Skyhunter",
    "Skywalker",
    "Slughorn",
    "Slytherin",
    "Snowblood",
    "Steel",
    "Steelfist",
    "Steelsoul",
    "Stone",
    "Stonebreak",
    "Stoneface",
    "Stonefist",
    "Stoneheart",
    "Stonekettle",
    "Stonenose",
    "Stoneskin",
    "Stonesword",
    "Stormborn",
    "Stormson",
    "Sunhunter",
    "Suntail",
    "Tyrrel",
    "Warborn",
    "Waylander",
    "White",
    "Winter",
    "Wolff",
    "Zhu",
]
