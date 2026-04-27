import gc
import os
import uuid
from pathlib import Path

import ezdxf

# Must be set before matplotlib import
os.environ.setdefault("MPLCONFIGDIR", "/tmp/matplotlib")
os.makedirs("/tmp/matplotlib", exist_ok=True)


def render_dxf_to_png(dxf_file_path: str, output_folder: str) -> str:
    """
    Render DXF to PNG preview using low-memory matplotlib settings.
    Matplotlib is imported lazily to avoid memory usage during app startup.
    """

    import matplotlib

    matplotlib.use("Agg")

    import matplotlib.pyplot as plt
    from ezdxf.addons.drawing import RenderContext, Frontend
    from ezdxf.addons.drawing.matplotlib import MatplotlibBackend

    os.makedirs(output_folder, exist_ok=True)

    doc = ezdxf.readfile(dxf_file_path)
    modelspace = doc.modelspace()

    preview_filename = f"cad-preview-{uuid.uuid4()}.png"
    preview_path = os.path.join(output_folder, preview_filename)

    fig = None

    try:
        fig = plt.figure(figsize=(5, 5), dpi=90)

        ax = fig.add_axes([0, 0, 1, 1])
        ax.set_facecolor("white")
        ax.axis("off")

        context = RenderContext(doc)
        backend = MatplotlibBackend(ax)
        frontend = Frontend(context, backend)

        frontend.draw_layout(modelspace, finalize=True)

        ax.autoscale()
        ax.set_aspect("equal", adjustable="box")

        fig.savefig(
            preview_path,
            dpi=90,
            bbox_inches="tight",
            pad_inches=0.03,
            facecolor="white",
        )

        return preview_filename

    finally:
        if fig is not None:
            plt.close(fig)

        del doc
        gc.collect()


def generate_cad_preview(file_path: str, output_folder: str) -> str:
    """
    Render preview for DXF only.

    DWG preview is disabled on Render free because DWG conversion requires
    external tools and more memory.
    """

    suffix = Path(file_path).suffix.lower()

    if suffix == ".dxf":
        return render_dxf_to_png(file_path, output_folder)

    if suffix == ".dwg":
        raise ValueError(
            "DWG preview is disabled on Render free. Please upload DXF for preview."
        )

    raise ValueError("Only DXF preview is supported")