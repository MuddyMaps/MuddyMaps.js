# Muddy Maps

Create your own Muddy Maps, neutralizing maps, and winner take all maps using a CSV file and a simple configuration file.

## What's a Muddy Map?

"Muddy" maps use the Muddy Maps algorithm first described on the STEM Lounge article ["Muddy America : Color Balancing The Election Map"](https://stemlounge.com/muddy-america-color-balancing-trumps-election-map-infographic/) in order to color-balance margins and totals for multi-categorical geospacial data.

#### Muddy Map

![2016 US Election Muddy Map](https://stemlounge.com/content/images/2019/10/muddy_america_2016_static-1.png "2016 US Election Muddy Map")

#### Neutralizing Map

![2016 US Election Neutralizing Map](https://stemlounge.com/content/images/2019/10/2016_neutralizing_map.png "2016 US Election Neutralizing Map")

#### Also supports Winner-Takes-All maps

![2016 US Election County-Level Winner-Takes-All map](https://stemlounge.com/content/images/2019/10/countywinner_2016.png "2016 US Election County-Level Winner-Takes-All map")

## Features:
- Easy setup. Just add your columns in a CSV and define them in settings.json.
- Automatically calculates win margins and relative vote totals.
- Automatically applies Hue, Saturation, and Lightness to each county based on margins and win totals.
- Automatically Calculates and applies Upper Fence.

Visualizations supported
- Muddy Maps
- Neutralizing Maps
- Winner Take All Maps

Maps currently supported
- United States of America, County-level

Upcoming features:
- Account for population-density 



## How to use

### 1. Configure settings.json

Take a look at the settings.json file to get a feel for how it's configured. If you need further assistance, refer to this documentation.

#### Required settings.json parameters:

|  parameter | type  |  description |   |   |
|---|---|---|---|---|
| fipsColumn  | int  |  The CSV column for county FIPS IDs |   |   |
| categories  | array of Category objects  |  See "Category object" |   |   |
| type  |  text (string) |  The type of data visualization. <br/><br/>Currently supports:<ul><li> "muddy"</li> <li>"neutralizing"</li> <li> "winnerTakesAll"</li> </ul> Defaults to muddy. |   |   |

##### Category object

In order for Muddy Maps to run analysis on your geospacial data, it needs to know where to get the categories being compared from the CSV, and the colors to use for each category.

To do this, you include a category object for each category in your CSV.

###### category object parameters:

|  parameter | type  |  description | required  |   |
|---|---|---|---|---|
| title  | text (string)  |  The title of the category. Can be whatever you want it to be, and doesn't need to match the column title in the CSV. | no  |   |
| column  | int  |  The CSV column for the category |  yes |   |
|  hue | int hue number (x/360)  |  The color to apply to counties where this county is the winner |   |   |

#### Example settings.json:

```json
{
    "fipsColumn": 1,
    "type": "muddy",
    "categories": [
        {
            "title": "dvote",
            "column": 4,
            "hue": 240
        },
        {
            "title": "gvote",
            "column": 5,
            "hue": 0
        }
    ]
}
```

#### Optional parameters:

|  parameter | type  |  description |  default |   |
|---|---|---|---|---|
| distinguishUpper  | bool  |  Whether or not to add a border to the counties that have totals above the upper fence | false  |   |
| upperHue  | int hue number (x/360) |  The border color to apply to counties that have totals above the upper fence | 60  |   |
|   |   |   |   |   |


## 2. Set up a local webserver

This project runs entirely in the browser and does not require any server computation. However, due to modern web browsers' adherence to the same origin policy, you need to serve the files from a webserver that allows same origin policy. This will allow Muddy Maps to access your CSV to read the data and do its analysis.

How to set up a simple HTTP server on a mac:

### Use Python's SimpleHTTPServer

Inside your terminal, visit the root directory of this project. 

```terminal
$ cd muddyMaps
```

Then, run the following Python command to set up a local HTTP server. It will serve the files in this directory on port 8001.

```terminal

$ Python -m SimpleHTTPServer 8001
```

When you're finished using the HTTP server, go back to the terminal and safely terminate the HTTP server with `ctrl + c`.


#### Contributors

- Larry Weru (@LDubya)
