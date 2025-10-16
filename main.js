import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import embed from "https://cdn.jsdelivr.net/npm/vega-embed@6/+esm";
import * as vl from "https://cdn.jsdelivr.net/npm/vega-lite-api@5/+esm";

async function fetchData() {
  const data = await d3.csv("./dataset/videogames_wide.csv");
  return data;
}

async function drawVisualizations() {
  const data = await fetchData();

  //calculate window size
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  //https://www.w3schools.com/jsref/prop_win_innerheight.asp Reference to the window.InnerWidth variable.

  //calculate current viewport size using a math formula
  const chartWidth = Math.min(viewportWidth * 0.9, viewportWidth);
  const chartHeight = Math.min(viewportHeight * 0.45, viewportHeight);

  //Clear the visualizations so it can be re-painted. 
  document.querySelector("#canvas1").innerHTML = "";
  document.querySelector("#canvas2").innerHTML = "";
  document.querySelector("#canvas3").innerHTML = "";
  document.querySelector("#canvas4").innerHTML = "";

  const vlSpec = vl
    //https://observablehq.com/@observablehq/vega-lite-chart-types Reference to heatmaps
    //https://vega.github.io/vega-lite/docs/aggregate.html Reference to Aggregate transform
    //https://observablehq.com/@viscourse/transformations This dataset also helped alot
    .markBar()
    .data(data)
    .transform(
      vl.aggregate(vl.sum("Global_Sales").as("Global_Sales")).groupby(["Genre", "Platform"]),
      vl.impute("Global_Sales").key("Platform").groupby(["Genre"]).value(0)
      //https://vega.github.io/vega-lite/docs/impute.html Impute reference
    )
    .encode(
      vl.y().fieldN("Genre"),
      vl.x().fieldN("Platform"),
      vl.color()
        .fieldN("Global_Sales")
        .scale({ scheme: "orangered", reverse: true })
        //https://observablehq.com/d/4afb7848628c6b22 Helped me find colorscales for this dataset
        .legend(false),
      vl.tooltip([ //Tooltip reference: https://www.youtube.com/watch?v=YAYwyly81uo
        vl.fieldN("Platform"),
        vl.fieldN("Genre"),
        vl.fieldQ("Global_Sales"),
      ])
    )
    .title("Heatmap of Global Sales across platforms (Dark red signifies most sales)")
    .width(chartWidth)
    .height(chartHeight)
    .config({ //https://vega.github.io/vega/docs/specification/#autosize I used config to help ensure legends and other parts of the chart didnt go outside their windows
      autosize: { type: "fit", contains: "padding" },
      view: { stroke: "transparent" },
    })
    .toSpec();



  const vlSpec2 = vl
    .markBar()
    .data(data)
    .transform(vl.filter("datum.Year != 'N/A'"))
    //https://stackoverflow.com/questions/71431037/in-vega-lite-how-do-i-filter-by-time 
    //This article helped me find out how to filter null times out
    .encode(
      vl.x().fieldN("Year").title("Year"),
      vl.y().fieldQ("Global_Sales").aggregate("sum").title("Global Sales"),
      vl.color()
        .fieldN("Platform")
        .legend(false)
        .scale({ scheme: "tableau20" }),
      vl.facet(vl.row().fieldN("Genre").title("Genre")).columns(3),
      //https://observablehq.com/@observablehq/layers-facets-concat .facet Reference
      vl.tooltip([
        vl.fieldN("Genre"),
        vl.fieldN("Platform"),
        vl.fieldN("Publisher"),
      ])
    )
    .width(chartWidth / 3 - 40)
    .height(chartHeight)
    .config({
      autosize: { type: "fit", contains: "padding" },
      view: { stroke: "transparent" },
    })
    .title("Global sales of platforms over each year, spread across different charts")
    .toSpec();




    const vlSpec3 = vl
    .markBar()
    .data(data)
   .transform(
    vl.fold(["NA_Sales", "EU_Sales", "JP_Sales", "Other_Sales"]).as(["Region", "Sales"]),
    //https://vega.github.io/vega-lite/docs/fold.html Helped me figure out how .fold worked
  )
    .encode(
    vl.x().fieldN("Platform").title("Platform"),
    vl.y().fieldQ("Sales").aggregate("sum").title("Total Global Sales (Counted in Millions)").stack(null),
    vl.color().fieldN("Region").title("Region"),
    vl.tooltip([
      vl.fieldN("Platform"),
      vl.fieldN("Region"),
    ])
  )
    .title("Which region liked which platform? The amount of sales each region had, organized by genre")
    .width(chartWidth)
    .height(chartHeight)
    .config({
      autosize: { type: "fit", contains: "padding" },
      view: { stroke: "transparent" },
    })
    .toSpec();



    const vlSpec4 = vl
    .markBar()
    .data(data)
    .transform(
        vl.aggregate(vl.sum("Genre").as("Genre")).groupby(["Global_Sales", "Year", "Publisher"]),
        vl.aggregate(vl.sum("Global_Sales").as("Global_Sales")).groupby(["Genre", "Year", "Publisher"]),
        vl.filter("datum.Publisher == 'Electronic Arts' || datum.Publisher == 'Activision' || datum.Publisher == 'Namco Bandai Games' || datum.Publisher == 'Nintendo'"),
        vl.filter("datum.Year != 'N/A'")
        //https://observablehq.com/@viscourse/transformations Heled me find out how .filer worked
  )
    .encode(
    vl.x().fieldN("Year").title("Year"),
    vl.y().fieldQ("Global_Sales").aggregate("sum").title("Global Sales"),
    vl.color().fieldN("Publisher").title("Publisher").sort("descending"),
     vl.tooltip(
      [
        vl.fieldN("Publisher"),
        vl.fieldQ("Global_Sales"), 
      ]
    )
  )
     .title("Is Nintendo King? Nintendo Vs top 3 publishers in terms of global sales from 1980-2016")
    .width(chartWidth)
    .height(chartHeight)
    .config({
      autosize: { type: "fit", contains: "padding" },
      view: { stroke: "transparent" },
    })
    .toSpec();


  await render("#canvas1", vlSpec);
  await render("#canvas2", vlSpec2);
  await render("#canvas3", vlSpec3);
  await render("#canvas4", vlSpec4);
}

async function render(viewID, spec) {
  const result = await embed(viewID, spec, {
    actions: false,
    renderer: "svg",
  });
  result.view.run();
}
drawVisualizations();


//function to handle window resizing for the 2nd visualization
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(drawVisualizations, 200); // redraw after user stops resizing
});
