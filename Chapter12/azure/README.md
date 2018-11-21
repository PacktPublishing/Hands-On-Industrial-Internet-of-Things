
# Hands-On Industrial Internet of Things, Antonio Capasso & Giacomo Veneri, Packt, 2018

# Chapter 12

below the U-SQL for Azure Analytics


## Stream Analytics - U-SQL

```

SELECT
    deviceId AS device,
    ts,
    temperature, 
    flow, 
    udf.efficiency(temperature,flow)
INTO
    efficiencyoutput
FROM
    iiothub

```


## Advanced Stream Analytics - U-SQL


```
SELECT
    deviceId AS Device,
    max(ts),
    Avg(temperature) AS temperature, 
    Avg(flow) AS flow, 
    Avg(udf.efficiency(temperature,flow)) AS efficiency
INTO
    efficiencyoutput
FROM
    iiothub 
TIMESTAMP BY ts
GROUP BY TumblingWindow(second,5), deviceId

```

## Data Lake Analytics - Efficiency U-SQL



```

DECLARE @now DateTime = DateTime.Now;
DECLARE @outputfile = "/out/reports/"+@now.ToString("yyyy/MM/dd")+"-efficiency.csv";

// Step 1: extract data and skip the first row
@d = 
    EXTRACT device string,
            ts string,
            temperature float,
            flow float,
            efficiency float,
            date DateTime,
            filename string
    FROM "/out/logs/{date:yyyy}/{date:MM}/{date:dd}/{filename}.csv"
    USING Extractors.Tsv(skipFirstNRows:1);

// Step 2: build result
@result = SELECT 
            AVG(efficiency) AS efficiency, 
            device, 
            date
          FROM @d
          GROUP BY device, date;

// Step 3: write the OUTPUT
OUTPUT @result
TO @outputfile 
USING Outputters.Text();

```

## Data Lake Analytics -  Custom Formatter

```

REFERENCE ASSEMBLY [ExtPython];

DECLARE @myScript = @"

def usqlml_main(df):
    return df.median('efficiency')
";

@result =
    REDUCE @d ON device
    PRODUCE device string, efficiency string
    USING new Extension.Python.Reducer(pyScript:@myScript);
…
```