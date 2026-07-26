import { useState } from 'react';
import TopBar from './layout/TopBar';
import SplitPane from './layout/SplitPane';
import { DATASETS } from './db/datasets';

export default function App() {
  const [datasetId, setDatasetId] = useState(DATASETS[0].id);
  const dataset = DATASETS.find((d) => d.id === datasetId) ?? DATASETS[0];

  return (
    <div className="h-screen flex flex-col bg-navy">
      <TopBar
        dataset={dataset}
        onDatasetChange={setDatasetId}
        onClearHistory={() => {}}
      />
      <SplitPane
        left={
          <div className="flex-1 flex items-center justify-center text-dimmed text-sm">
            Editor placeholder
          </div>
        }
        right={
          <div className="flex-1 flex items-center justify-center text-dimmed text-sm">
            Results placeholder
          </div>
        }
      />
    </div>
  );
}
