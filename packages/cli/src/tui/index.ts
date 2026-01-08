import blessed from 'blessed';
import contrib from 'blessed-contrib';
import { api } from '../lib/api';
import { io, Socket } from 'socket.io-client';

export function launchTUI() {
  const screen = blessed.screen({
    smartCSR: true,
    title: 'Industrial Gateway Platform - TUI',
    fullUnicode: true,
  });

  const grid = new contrib.grid({
    rows: 12,
    cols: 12,
    screen: screen,
  });

  // Header
  const header = grid.set(0, 0, 1, 12, blessed.box, {
    content: '{center}{bold}🏭 INDUSTRIAL GATEWAY PLATFORM - TERMINAL UI{/bold}{/center}',
    tags: true,
    style: {
      fg: 'cyan',
      bg: 'black',
      border: {
        fg: 'cyan',
      },
    },
    border: {
      type: 'line',
    },
  });

  // Stats boxes
  const inputPlcsBox = grid.set(1, 0, 2, 3, blessed.box, {
    label: ' INPUT PLCs ',
    content: '{center}Loading...{/center}',
    tags: true,
    style: {
      fg: 'white',
      border: {
        fg: 'green',
      },
    },
    border: {
      type: 'line',
    },
  });

  const outputPlcsBox = grid.set(1, 3, 2, 3, blessed.box, {
    label: ' OUTPUT PLCs ',
    content: '{center}Loading...{/center}',
    tags: true,
    style: {
      fg: 'white',
      border: {
        fg: 'blue',
      },
    },
    border: {
      type: 'line',
    },
  });

  const mappingsBox = grid.set(1, 6, 2, 3, blessed.box, {
    label: ' ACTIVE MAPPINGS ',
    content: '{center}Loading...{/center}',
    tags: true,
    style: {
      fg: 'white',
      border: {
        fg: 'magenta',
      },
    },
    border: {
      type: 'line',
    },
  });

  const tagsBox = grid.set(1, 9, 2, 3, blessed.box, {
    label: ' TOTAL TAGS ',
    content: '{center}Loading...{/center}',
    tags: true,
    style: {
      fg: 'white',
      border: {
        fg: 'yellow',
      },
    },
    border: {
      type: 'line',
    },
  });

  // PLC List Table
  const plcTable = grid.set(3, 0, 5, 6, contrib.table, {
    keys: true,
    vi: true,
    label: ' PLCs ',
    columnSpacing: 1,
    columnWidth: [20, 12, 10, 8],
    style: {
      fg: 'white',
      border: {
        fg: 'cyan',
      },
      header: {
        fg: 'cyan',
        bold: true,
      },
      cell: {
        selected: {
          bg: 'blue',
        },
      },
    },
    border: {
      type: 'line',
    },
  });

  plcTable.setData({
    headers: ['Name', 'Brand', 'Protocol', 'Status'],
    data: [['Loading...', '...', '...', '...']],
  });

  // Live Tag Chart
  const tagChart = grid.set(3, 6, 5, 6, contrib.line, {
    label: ' Tag Values (Real-time) ',
    showNthLabel: 5,
    showLegend: true,
    legend: { width: 12 },
    style: {
      line: 'yellow',
      text: 'green',
      baseline: 'black',
      border: {
        fg: 'cyan',
      },
    },
    border: {
      type: 'line',
    },
    xLabelPadding: 3,
    xPadding: 5,
  });

  // System Logs
  const logBox = grid.set(8, 0, 4, 12, contrib.log, {
    label: ' System Logs ',
    tags: true,
    style: {
      fg: 'white',
      border: {
        fg: 'cyan',
      },
    },
    border: {
      type: 'line',
    },
  });

  // Socket connection status
  let socket: Socket | null = null;
  let connected = false;

  const statusBar = blessed.box({
    parent: screen,
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    content: ' Status: Disconnected | Press q to quit, r to refresh',
    style: {
      fg: 'white',
      bg: 'black',
    },
  });

  // Data structures
  const tagHistory: Map<string, { x: string[]; y: number[] }> = new Map();
  let plcData: any[] = [];

  // Load data
  async function loadData() {
    try {
      const [plcs, mappings] = await Promise.all([api.getPlcs(), api.getMappings()]);

      plcData = plcs;

      const inputCount = plcs.filter((p: any) => p.type === 'INPUT').length;
      const outputCount = plcs.filter((p: any) => p.type === 'OUTPUT').length;
      const activeCount = mappings.filter((m: any) => m.enabled).length;
      const totalTags = plcs.reduce((sum: number, p: any) => sum + (p._count?.tags || 0), 0);

      inputPlcsBox.setContent(`{center}{bold}{green-fg}${inputCount}{/green-fg}{/bold}{/center}`);
      outputPlcsBox.setContent(`{center}{bold}{blue-fg}${outputCount}{/blue-fg}{/bold}{/center}`);
      mappingsBox.setContent(`{center}{bold}{magenta-fg}${activeCount}{/magenta-fg}{/bold}{/center}`);
      tagsBox.setContent(`{center}{bold}{yellow-fg}${totalTags}{/yellow-fg}{/bold}{/center}`);

      const tableData = plcs.map((plc: any) => [
        plc.name.substring(0, 20),
        plc.brand.substring(0, 12),
        plc.protocol.substring(0, 10),
        plc.enabled ? '● ON' : '○ OFF',
      ]);

      plcTable.setData({
        headers: ['Name', 'Brand', 'Protocol', 'Status'],
        data: tableData,
      });

      screen.render();

    } catch (error: any) {
      logBox.log(`{red-fg}Error loading data: ${error.message}{/red-fg}`);
      screen.render();
    }
  }

  // Connect to real-time updates
  function connectSocket() {
    socket = io('http://localhost:3000');

    socket.on('connect', () => {
      connected = true;
      statusBar.setContent(' Status: {green-fg}● Connected{/green-fg} | Press q to quit, r to refresh');
      logBox.log('{green-fg}Connected to gateway{/green-fg}');
      screen.render();
    });

    socket.on('disconnect', () => {
      connected = false;
      statusBar.setContent(' Status: {red-fg}○ Disconnected{/red-fg} | Press q to quit, r to refresh');
      logBox.log('{red-fg}Disconnected from gateway{/red-fg}');
      screen.render();
    });

    socket.on('tag:update', (data: any) => {
      const key = data.tagName;

      if (!tagHistory.has(key)) {
        tagHistory.set(key, {
          x: [],
          y: [],
        });
      }

      const history = tagHistory.get(key)!;
      const timestamp = new Date(data.timestamp).toLocaleTimeString();

      history.x.push(timestamp);
      history.y.push(data.value);

      // Keep only last 20 points
      if (history.x.length > 20) {
        history.x.shift();
        history.y.shift();
      }

      // Update chart with up to 3 tags
      const series: any = [];
      let index = 0;
      for (const [name, hist] of tagHistory.entries()) {
        if (index >= 3) break;
        series.push({
          title: name,
          x: hist.x,
          y: hist.y,
          style: { line: ['yellow', 'green', 'cyan'][index] },
        });
        index++;
      }

      if (series.length > 0) {
        tagChart.setData(series);
        screen.render();
      }
    });

    socket.on('system:log', (log: any) => {
      const level = log.level === 'ERROR' ? '{red-fg}' : log.level === 'WARN' ? '{yellow-fg}' : '{green-fg}';
      logBox.log(`${level}[${log.level}]{/} {cyan-fg}${log.source}{/}: ${log.message}`);
      screen.render();
    });

    socket.on('plc:status', (data: any) => {
      logBox.log(`{cyan-fg}PLC{/}: ${data.plcName} → {green-fg}${data.status}{/}`);
      loadData(); // Refresh PLC list
    });
  }

  // Key bindings
  screen.key(['escape', 'q', 'C-c'], () => {
    if (socket) {
      socket.disconnect();
    }
    return process.exit(0);
  });

  screen.key(['r'], () => {
    logBox.log('{cyan-fg}Refreshing data...{/}');
    loadData();
  });

  // Initial load
  loadData();
  connectSocket();

  // Auto-refresh every 10 seconds
  setInterval(loadData, 10000);

  screen.render();
}
