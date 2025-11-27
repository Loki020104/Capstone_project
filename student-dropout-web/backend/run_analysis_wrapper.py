import os
import runpy
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

BASE = os.path.dirname(os.path.abspath(__file__))
ANALYSIS = os.path.join(BASE, 'analysis.py')
RESULTS_DIR = os.path.join(BASE, 'static', 'results')

os.makedirs(RESULTS_DIR, exist_ok=True)

# Run the provided analysis.py as a script
# It should create matplotlib figures; we will save any open figures after execution
try:
    runpy.run_path(ANALYSIS, run_name='__main__')
except SystemExit:
    # allow analysis scripts that call sys.exit()
    pass
except Exception as e:
    print('ERROR running analysis.py:', e)

# Save all open figures
saved = []
for i, num in enumerate(plt.get_fignums(), start=1):
    fig = plt.figure(num)
    fname = f'figure_{i}.png'
    out_path = os.path.join(RESULTS_DIR, fname)
    try:
        fig.savefig(out_path, bbox_inches='tight')
        saved.append(fname)
        print(fname)
    except Exception as e:
        print(f'ERROR saving figure {num}:', e)

# close all to free memory
plt.close('all')

if not saved:
    print('No figures were saved. Is analysis.py creating matplotlib figures?')
